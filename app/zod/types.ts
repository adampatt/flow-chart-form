import { z } from 'zod';
import { Node } from '@xyflow/react';

// Define base node data
const BaseNodeData = z.object({
  id: z.string(),
  type: z.enum(['threshold', 'long', 'steady', 'hills', 'tempo', 'parent', 'week']),
});

// Define specific node data types
const WorkoutNodeData = BaseNodeData.extend({
  type: z.enum(['threshold', 'long', 'steady', 'hills', 'tempo']),
  name: z.string(),
  description: z.string().optional(),
  duration: z.number(),
  workout_id: z.string(),
  stress: z.number(),
  user_id: z.string(),
  selected_id: z.string().optional(),
});



const ParentNodeData = BaseNodeData.extend({
  type: z.literal('parent'),
  userStressScore: z.enum(['beginner', 'intermediate', 'advanced']),
});

const WeekNodeData = BaseNodeData.extend({
  type: z.literal('week'),
  weekNumber: z.number(),
  weeklyTotalStress: z.number(),
  usedHandles: z.array(z.string()),
  total_times_per_week: z.number(),
  weekWorkoutCountFull: z.boolean(),
});

// Create a union type for all node datadefaultStressScore
const NodeData = z.discriminatedUnion('type', [
  WorkoutNodeData,
  ParentNodeData,
  WeekNodeData,
]);

// Define custom node types
type WorkoutNodeSchema = Node<z.infer<typeof WorkoutNodeData>>;
type ParentNodeSchema = Node<z.infer<typeof ParentNodeData>>;
type WeekNodeSchema = Node<z.infer<typeof WeekNodeData>>;

// Update CustomNodeData to include user_id and selected_id
const CustomNodeData = WorkoutNodeData.pick({
  name: true,
  description: true,
  type: true,
  duration: true,
  workout_id: true,
  stress: true,
  user_id: true,
  selected_id: true,
});

type CustomNodeSchema = z.infer<typeof CustomNodeData>;

// Create a union type for all custom nodes
type CustomNode = WorkoutNodeSchema | ParentNodeSchema | WeekNodeSchema;

// Export the types
export type { CustomNode, WorkoutNodeSchema, ParentNodeSchema, WeekNodeSchema, CustomNodeSchema };
export { NodeData, WorkoutNodeData, CustomNodeData };

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

export const stressScoreConvertStringToNumber: StressScore = {
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

export const WorkoutSchema = z.object({
  workout_id: z.string(),
  name: z.string().min(1),
  type: z.enum(['threshold', 'long', 'steady', 'hills', 'tempo']),
  duration: z.number(),
  description: z.string().min(1),
  stress: z.number(),
});
