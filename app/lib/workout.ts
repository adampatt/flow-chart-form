
import { WorkoutType } from '../zod/types';

export const WorkoutTypeColors: Record<WorkoutType, { border: string; background: string }> = {
    threshold: { border: 'border-threshold', background: 'bg-threshold' },
    long: { border: 'border-long', background: 'bg-long' },
    steady: { border: 'border-steady', background: 'bg-steady' },
    hills: { border: 'border-hills', background: 'bg-hills' },
    tempo: { border: 'border-tempo', background: 'bg-tempo' },
  };
  