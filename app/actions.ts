"use server";

import { 
  dbFetchAllWorkouts, 
  dbMarkWorkoutAsRemoved, 
  dbFetchSelectedWorkoutsByUserId, 
  dbUpdateUserDetails, 
  dbInsertWorkoutInNextAvailableSlot, 
  dbInsertSelectedWorkout,
  ValidationError,
  DatabaseError,
  dbFetchUserWorkoutConstraints
} from './db/services';
import { z } from 'zod';
import { SelectedWorkoutSchema, WorkoutSchema, UserSchema, UserWorkoutConstraints, SelectWorkoutSchema } from './zod/types';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function getAllWorkouts(): Promise<{ success: boolean; data?: z.infer<typeof WorkoutSchema>[]; error?: string }> {
  try {
    const result = await dbFetchAllWorkouts();
    return result;
  } catch (error) {
    console.error('Error in getAllWorkouts:', error);
    if (error instanceof ValidationError) {
      return { success: false, error: `Validation error: ${error}` };
    } else if (error instanceof DatabaseError) {
      return { success: false, error: `Database error: ${error}` };
    } else {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}

export async function getSelectedWorkoutsForUser(user_id: string): Promise<{ success: boolean; data?: z.infer<typeof SelectedWorkoutSchema>[]; error?: string }> {
  try {
    const result = await dbFetchSelectedWorkoutsByUserId(user_id);
    return result;
  } catch (error) {
    console.error('Error in getSelectedWorkoutsForUser:', error);
    if (error instanceof ValidationError) {
      return { success: false, error: `Validation error: ${error}` };
    } else if (error instanceof DatabaseError) {
      return { success: false, error: `Database error: ${error}` };
    } else {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}

const getStressScore = (fitnessLevel: z.infer<typeof UserSchema>['fitness_level']): number => {
    switch (fitnessLevel) {
      case 'beginner':
        return 20;
      case 'intermediate':
        return 30;
      case 'advanced':
        return 40;
      default:
        return 20; 
    }
  };

export async function createUser(userWorkoutFrequencyDetails: z.infer<typeof UserSchema>):  Promise<{ success: boolean; data?: z.infer<typeof UserSchema>; error?: string }> {
  const userDetails = {
    fitness_level: userWorkoutFrequencyDetails.fitness_level,
    times_per_week: userWorkoutFrequencyDetails.times_per_week
  };

  try {
    const result = await dbUpdateUserDetails(userDetails);
    if (result.success && result.data) {
          const stressScore = getStressScore(result.data.fitness_level);
          await addWorkoutToUserPlan(result.data.id!, stressScore, result.data.times_per_week);
          redirect(`/workoutBuilder/${result.data.id}`);
        };
        return { success: true, data: result.data };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { success: false, error: `Validation error: ${error}` };
    } else if (error instanceof DatabaseError) {
      return { success: false, error: `Database error: ${error}` };
    } else if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error; // Re-throw the redirect "error" so Next.js can handle it
    } else {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}

export async function planWorkoutSchedule(selectedWorkout: z.infer<typeof SelectedWorkoutSchema>): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await dbInsertSelectedWorkout(selectedWorkout);
    return result;
  } catch (error) {
    console.error('Error in planWorkoutSchedule:', error);
    if (error instanceof ValidationError) {
      return { success: false, error: `Validation error: ${error}` };
    } else if (error instanceof DatabaseError) {
      return { success: false, error: `Database error: ${error}` };
    } else {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}

export async function addWorkoutToUserPlan(
  userId: string,
  maxStressScore: number,
  maxWorkoutCount: number
): Promise<{ success: boolean; data?: { [key: number]: z.infer<typeof WorkoutSchema>[] }; error?: string }> {
  try {
    const allWorkoutsResult = await dbFetchAllWorkouts();
    if (!allWorkoutsResult.success || !allWorkoutsResult.data) {
      return { success: false, error: allWorkoutsResult.error || 'No workouts available' };
    }

    const allWorkouts = allWorkoutsResult.data;
    const weeklyPlans: { [key: number]: z.infer<typeof WorkoutSchema>[] } = {};

    for (let week = 1; week <= 4; week++) {
      const selectedWorkouts: z.infer<typeof WorkoutSchema>[] = [];
      let totalStress = 0;
      const workoutTypes = allWorkouts.map(w => w.type);

      for (let i = 0; i < maxWorkoutCount; i++) {
        const availableTypes = workoutTypes.filter(type => !selectedWorkouts.some(w => w.type === type));
        if (availableTypes.length === 0) break;

        const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        const workoutsOfType = allWorkouts.filter(w => w.type === randomType && w.stress + totalStress <= maxStressScore);

        if (workoutsOfType.length > 0) {
          const selectedWorkout = workoutsOfType[Math.floor(Math.random() * workoutsOfType.length)];
          selectedWorkouts.push(selectedWorkout);
          totalStress += selectedWorkout.stress;

          const insertResult = await dbInsertSelectedWorkout({
            user_id: userId,
            workout_id: selectedWorkout.workout_id,
            week_number: week,
            position_in_week: i + 1
          });

          if (!insertResult.success) {
            return { success: false, error: insertResult.error || 'Failed to insert workout' };
          }
        }

        if (totalStress >= maxStressScore) break;
      }

      weeklyPlans[week] = selectedWorkouts;
    }

    return { success: true, data: weeklyPlans };
  } catch (error) {
    console.error('Error in addWorkoutToUserPlan:', error);
    if (error instanceof ValidationError) {
      return { success: false, error: `Validation error: ${error}` };
    } else if (error instanceof DatabaseError) {
      return { success: false, error: `Database error: ${error}` };
    } else {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}

export async function removeWorkoutFromUserPlan(workoutId: string, userId: string, selected_id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await dbMarkWorkoutAsRemoved(workoutId, userId, selected_id);
    if (result.success) {
      revalidatePath(`/workoutBuilder/${userId}`);
    }
    return result;
  } catch (error) {
    console.error('Error in removeWorkoutFromUserPlan:', error);
    if (error instanceof ValidationError) {
      return { success: false, error: `Validation error: ${error}` };
    } else if (error instanceof DatabaseError) {
      return { success: false, error: `Database error: ${error}` };
    } else {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}


export async function insertWorkoutIntoWeek(input: z.infer<typeof SelectWorkoutSchema>): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await dbInsertWorkoutInNextAvailableSlot(input);
    if (result.success) {
      revalidatePath(`/workoutBuilder/${input.user_id}`);
    }
    return result;
  } catch (error) {
    console.error('Error in insertWorkoutIntoWeek:', error);
    if (error instanceof ValidationError) {
      return { success: false, error: `Validation error: ${error}` };
    } else if (error instanceof DatabaseError) {
      return { success: false, error: `Database error: ${error}` };
    } else {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}

export async function getUserWorkoutConstraints(userId: string): Promise<{ success: boolean; data?: z.infer<typeof UserWorkoutConstraints>; error?: string }> {
  try {
    const userWorkoutConstraint = await dbFetchUserWorkoutConstraints(userId);
    if (!userWorkoutConstraint.success || !userWorkoutConstraint.data) {
      return { success: false, error: userWorkoutConstraint.error || 'No selected workouts found' };
    }
    
    console.log('userWorkoutConstraint FETCHED DATA', userWorkoutConstraint.data);
    return userWorkoutConstraint
  } catch (error) {
    console.error('Error in getUserStressScore:', error);
    if (error instanceof ValidationError) {
      return { success: false, error: `Validation error: ${error}` };
    } else if (error instanceof DatabaseError) {
      return { success: false, error: `Database error: ${error}` };
    } else {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}
