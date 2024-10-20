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
  dbFetchUserStressScore
} from './db/services';
import { z } from 'zod';
import { SelectedWorkoutSchema, WorkoutSchema, UserSchema } from './zod/types';
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

export async function createUser(prevState: any, formData: FormData): Promise<{ success: boolean; data?: z.infer<typeof UserSchema>; error?: string }> {
  const fitnessLevels: Array<z.infer<typeof UserSchema>['fitness_level']> = ['beginner', 'intermediate', 'advanced'];
  const rawFitnessLevel = formData.get('fitness_level') as string;
  const rawWorkoutTimesPerWeek = formData.get('workout_times_per_week') as string;

  const fitnessLevelIndex = parseInt(rawFitnessLevel, 10);
  const fitnessLevel = fitnessLevels[fitnessLevelIndex]; 
  const workoutTimesPerWeek = parseInt(rawWorkoutTimesPerWeek, 10);

  const userDetails = {
    fitness_level: fitnessLevel,
    workout_times_per_week: workoutTimesPerWeek
  };

  try {
    const result = await dbUpdateUserDetails(userDetails);
    if (result.success && result.data) {
          const stressScore = getStressScore(result.data.fitness_level);
          await addWorkoutToUserPlan(result.data.id!, stressScore, result.data.workout_times_per_week);
          redirect(`/workoutBuilder/${result.data.id}`);
        };
        return result;
  } catch (error) {
    console.error('Error in createUser:', error);
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

export async function insertWorkoutIntoWeek(prevState: unknown, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const weekNumber = parseInt(formData.get('week_number') as string, 10);
  const userId = formData.get('user_id') as string;
  const workoutId = formData.get('workout_id') as string;

  try {
    const result = await dbInsertWorkoutInNextAvailableSlot(weekNumber, userId, workoutId);
    if (result.success) {
      revalidatePath(`/workoutBuilder/${userId}`);
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

export async function getUserStressScore(userId: string): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const selectedWorkoutsResult = await dbFetchUserStressScore(userId);
    if (!selectedWorkoutsResult.success || !selectedWorkoutsResult.data) {
      return { success: false, error: selectedWorkoutsResult.error || 'No selected workouts found' };
    }

    return selectedWorkoutsResult
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