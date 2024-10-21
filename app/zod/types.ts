import { z } from 'zod';


export const WorkoutSchema = z.object({
  workout_id: z.string(),
  name: z.string().min(1),
  type: z.enum(['threshold', 'long', 'steady', 'hills', 'tempo']),
  duration: z.number(),
  description: z.string().min(1),
  stress: z.number(),
});

export type WorkoutType = z.infer<typeof WorkoutSchema>['type'];

export type FlowNodeType = WorkoutType | 'parent' | 'week';

export const SelectedWorkoutSchema = z.object({
  selected_id: z.string().uuid().optional(),
  description: z.string().optional(),
  duration: z.number().optional(),
  name: z.string().optional(),
  stress: z.number().optional(),
  user_id: z.string().uuid(),
  workout_id: z.string(),
  week_number: z.number(),
  position_in_week: z.number(),
  added_at: z.date().optional(),
  type: z.enum(['threshold', 'long', 'steady', 'hills', 'tempo']).optional(),
});

export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  fitness_level: z.enum(['beginner', 'intermediate', 'advanced']),
  times_per_week: z.number(),
});

export const FitnessLevel = ['beginner', 'intermediate', 'advanced'] as const;

export const UserWorkoutConstraints = UserSchema.omit({ id: true });

export const StressScoreSchema = z.object({
  beginner: z.number().default(30),
  intermediate: z.number().default(40),
  advanced: z.number().default(50),
});

export type StressScore = z.infer<typeof StressScoreSchema>;

export const defaultStressScore: StressScore = {
  beginner: 30,
  intermediate: 40,
  advanced: 50,
};

export const SelectWorkoutFormSchema = z.object({
  week_number: z.string(),
  category: z.enum(['threshold', 'long', 'steady', 'hills', 'tempo']),
  workout_id: z.string(),
});

export const SelectWorkoutSchema = z.object({
  week_number: z.number(),
  user_id: z.string().uuid(),
  workout_id: z.string(),
});