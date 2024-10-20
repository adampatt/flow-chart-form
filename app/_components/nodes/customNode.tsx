'use client';

import { removeWorkoutFromUserPlan } from '@/app/actions';
import { SelectedWorkoutSchema, WorkoutType } from '@/app/zod/types';
import { Card } from '@/components/ui/card';
import { Trash, Heart, Ruler, Mountains, Smiley, SneakerMove, Watch } from '@phosphor-icons/react';
import { NodeProps } from '@xyflow/react';
import { z } from 'zod';

const colourPicker: Record<string, { rgb: string; tailwind: string }> = {
  threshold: { rgb: 'rgb(249, 115, 22)', tailwind: 'orange-500' },
  long: { rgb: 'rgb(30, 58, 138)', tailwind: 'blue-900' },
  steady: { rgb: 'rgb(34, 197, 94)', tailwind: 'green-500' },
  hills: { rgb: 'rgb(127, 29, 29)', tailwind: 'red-900' },
  tempo: { rgb: 'rgb(250, 204, 21)', tailwind: 'yellow-400' },
};

type CustomNodeData = z.infer<typeof SelectedWorkoutSchema> & { userId: string; selected_id: string };

// Extend NodeProps with our custom data type
interface CustomNodeProps extends Omit<NodeProps, 'data'> {
  data: CustomNodeData;
}

function CustomNode(props: CustomNodeProps) {
  const { workout_id, name, type, duration, description, userId, selected_id } = props.data;

  const iconSelector = (icon: WorkoutType, colour: string) => {
    switch (icon) {
      case 'threshold':
        return (
          <Heart
            size={32}
            color={colour}
            weight="bold"
          />
        );
      case 'long':
        return (
          <Ruler
            size={32}
            color={colour}
            weight="bold"
          />
        );
      case 'steady':
        return (
          <Smiley
            size={32}
            color={colour}
            weight="bold"
          />
        );
      case 'hills':
        return (
          <Mountains
            size={32}
            color={colour}
            weight="bold"
          />
        );
      case 'tempo':
        return (
          <Watch
            size={32}
            color={colour}
            weight="bold"
          />
        );
      default:
        return (
          <SneakerMove
            size={32}
            color={colour}
            weight="bold"
          />
        );
    }
  };

  const borderColour = `border-${colourPicker[type!].tailwind}`;

  return (
    <Card className={`w-full max-w-md p-5 ${borderColour} border border-4 rounded-lg relative font-inter`}>
      <div className="absolute top-4 right-4">
        <button
          className="text-gray-500 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-full"
          aria-label="Delete card"
          onClick={() => removeWorkoutFromUserPlan(workout_id, userId, selected_id)}
        >
          <Trash
            size={28}
            color="red"
            weight="bold"
          />
        </button>
      </div>
      <div className="space-y-2">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-lg leading-tight tracking-tight">{name}</h3>
            {type && iconSelector(type, colourPicker[type].rgb)}
          </div>
          <p className="text-sm text-gray-600 leading-snug tracking-normal font-medium flex items-center">{duration} minutes</p>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed tracking-tight">{description}</p>
      </div>
    </Card>
  );
}
export default CustomNode;
