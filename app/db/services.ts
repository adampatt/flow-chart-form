'use server';

import { z } from 'zod';
import { sql } from '../lib/neon';
import { WorkoutSchema, SelectedWorkoutSchema, UserSchema } from '../zod/types';


type CustomErrorConstructor = new (message: string) => Error;

const createCustomError = (name: string): CustomErrorConstructor => {
  return class extends Error {
    constructor(message: string) {
      super(message);
      this.name = name;
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  };
};

export const ValidationError = createCustomError('ValidationError');
export const DatabaseError = createCustomError('DatabaseError')


async function dbService<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    if (error instanceof z.ZodError) {
      throw new ValidationError(`${errorMessage}: ${error.message}`);
    } else if (error instanceof Error) {
      throw new DatabaseError(`${errorMessage}: ${error.message}`);
    } else {
      throw new Error(`An unexpected error occurred: ${errorMessage}`);
    }
  }
}

export async function dbFetchAllWorkouts() {
  return dbService(
    async () => {
      const res = await sql`SELECT * FROM workouts ORDER BY type ASC`;
      return z.array(WorkoutSchema).parse(res);
    },
    'Error fetching workouts'
  );
}

export async function dbInsertSelectedWorkout(selectedWorkout: z.infer<typeof SelectedWorkoutSchema>) {
  const parsedWorkout = SelectedWorkoutSchema.safeParse(selectedWorkout);
  if (!parsedWorkout.success) {
    throw new ValidationError('Invalid workout data: ' + parsedWorkout.error.message);
  }

  return dbService(
    async () => {
      await sql`
        INSERT INTO selected_workouts (user_id, workout_id, week_number, position_in_week, removed)
        VALUES (
          ${parsedWorkout.data.user_id}, 
          ${parsedWorkout.data.workout_id}, 
          ${parsedWorkout.data.week_number}, 
          ${parsedWorkout.data.position_in_week},
          false
        );
      `;
    },
    'Error inserting selected workout'
  );
}

export async function dbUpdateUserDetails(userDetails: z.infer<typeof UserSchema>) {
  const parsedUser = UserSchema.safeParse(userDetails);
  if (!parsedUser.success) {
    throw new ValidationError('Invalid user data: ' + parsedUser.error.message);
  }

  return dbService(
    async () => {
      const result = await sql`
        INSERT INTO "user" (fitness_level, times_per_week)
        VALUES (
          ${parsedUser.data.fitness_level},
          ${parsedUser.data.workout_times_per_week}
        )
        RETURNING user_id, fitness_level, times_per_week;
      `;
      const user = result[0];
      return {
        id: user.user_id,
        fitness_level: user.fitness_level,
        workout_times_per_week: user.times_per_week
      };
    },
    'Error updating user details'
  );
}

export async function dbFetchSelectedWorkoutsByUserId(user_id: string) {
  return dbService(
    async () => {
      const res = await sql`
        SELECT sw.*, w.*
        FROM selected_workouts sw
        JOIN workouts w ON sw.workout_id = w.workout_id
        WHERE sw.user_id = ${user_id} 
        AND sw.removed = false
        ORDER BY sw.week_number, sw.position_in_week
      `;
      const CombinedSchema = SelectedWorkoutSchema.merge(WorkoutSchema);
      return z.array(CombinedSchema).parse(res);
    },
    'Error fetching selected workouts'
  );
}

export async function dbMarkWorkoutAsRemoved(workout_id: string, user_id: string, selected_id: string) {
  const parsedData = SelectedWorkoutSchema.pick({ workout_id: true, user_id: true, selected_id: true }).safeParse({ workout_id, user_id , selected_id});
  if (!parsedData.success) {
    throw new ValidationError('Invalid workout data: ' + parsedData.error.message);
  }

  return dbService(
    async () => {
      await sql`
        UPDATE selected_workouts
        SET removed = true
        WHERE workout_id = ${parsedData.data.workout_id} 
        AND user_id = ${parsedData.data.user_id}
        AND selected_id = ${selected_id}
      `;
    },
    'Error marking workout as removed'
  );
}

export async function insertWorkoutInNextAvailableSlot(weekNumber: number, userId: string, workoutId: string) {
  const parsedData = z.object({
    week_number: z.number(),
    user_id: z.string(),
    workout_id: z.string()
  }).safeParse({ week_number: weekNumber, user_id: userId, workout_id: workoutId });

  if (!parsedData.success) {
    throw new ValidationError('Invalid workout data: ' + parsedData.error.message);
  }

  return dbService(
    async () => {
      return await sql`
        WITH available_spots AS (
          SELECT position_in_week
          FROM selected_workouts
          WHERE user_id = ${userId}
          AND week_number = ${weekNumber}
          AND removed = FALSE
        ),
        max_times_per_week AS (
          SELECT times_per_week
          FROM "user"
          WHERE user_id = ${userId}
        ),
        next_position AS (
          SELECT MIN(position_in_week + 1) AS next_position
          FROM generate_series(1, (SELECT times_per_week FROM max_times_per_week)) AS gs(position_in_week)
          WHERE gs.position_in_week NOT IN (SELECT position_in_week FROM available_spots)
        )
        INSERT INTO selected_workouts (selected_id, user_id, workout_id, week_number, position_in_week)
        SELECT gen_random_uuid(), ${userId}, ${workoutId}, ${weekNumber}, (SELECT next_position FROM next_position)
        WHERE (SELECT COUNT(*) FROM available_spots) < (SELECT times_per_week FROM max_times_per_week)
        RETURNING *;
      `;
    },
    'Error inserting workout in next available slot'
  );
}
