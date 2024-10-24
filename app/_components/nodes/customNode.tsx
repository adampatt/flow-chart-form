'use client';

import React, { useMemo } from 'react';
import { removeWorkoutFromUserPlan } from '@/app/actions';
import { Card } from '@/components/ui/card';
import { Heart, Ruler, Mountains, Smiley, SneakerMove, Watch, Trash } from '@phosphor-icons/react';
import { WorkoutTypeColors } from '../../lib/workout';
import { CustomNodeSchema } from '@/app/zod/types';

const colourPicker: Record<string, { rgb: string; tailwind: string }> = {
  threshold: { rgb: 'rgb(249, 115, 22)', tailwind: 'orange-500' },
  long: { rgb: 'rgb(30, 58, 138)', tailwind: 'blue-900' },
  steady: { rgb: 'rgb(34, 197, 94)', tailwind: 'green-500' },
  hills: { rgb: 'rgb(127, 29, 29)', tailwind: 'red-900' },
  tempo: { rgb: 'rgb(250, 204, 21)', tailwind: 'yellow-400' },
};

type IconType = 'threshold' | 'long' | 'steady' | 'hills' | 'tempo';

const IconComponents = {
  threshold: Heart,
  long: Ruler,
  steady: Smiley,
  hills: Mountains,
  tempo: Watch,
  default: SneakerMove,
};

const iconSelector = (icon: IconType, colour: string) => {
  const IconComponent = IconComponents[icon] || IconComponents.default;
  return (
    <IconComponent
      size={32}
      color={colour}
      weight="bold"
    />
  );
};

interface CustomNodeProps {
  data: CustomNodeSchema;
}

function CustomNode({ data }: CustomNodeProps) {
  const { type, name, duration, description, workout_id, user_id, selected_id } = data;

  const memoizedIcon = useMemo(() => {
    if (type && type in IconComponents) {
      return iconSelector(type as IconType, colourPicker[type].rgb);
    }
    return null;
  }, [type]);

  return (
    <Card className={`w-full max-w-md p-5 ${type && WorkoutTypeColors[type].border} border border-4 rounded-lg relative font-inter`}>
      <div className="absolute top-4 right-4">
        <button
          className="text-gray-500 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-full"
          aria-label="Delete card"
          onClick={() => removeWorkoutFromUserPlan(workout_id, user_id, selected_id!)}
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
            {memoizedIcon}
          </div>
          <p className="text-sm text-gray-600 leading-snug tracking-normal font-medium flex items-center">{duration} minutes</p>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed tracking-tight">{description}</p>
      </div>
    </Card>
  );
}

export default CustomNode;
