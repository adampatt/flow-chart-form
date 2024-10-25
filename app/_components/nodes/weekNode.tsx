'use client';

import { Handle, NodeProps, Position } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { WeekNodeSchema } from '@/app/zod/types';

function WeekNode(props: NodeProps<WeekNodeSchema>) {
  const { weekNumber, weeklyTotalStress, usedHandles, weekWorkoutCountFull } = props.data;

  function handlePosition(weekNumber: number) {
    switch (weekNumber) {
      case 1:
        return Position.Top;
      case 2:
        return Position.Right;
      case 3:
        return Position.Left;
      case 4:
        return Position.Top;
      default:
        return Position.Top;
    }
  }

  return (
    <>
      <Handle
        type="target"
        position={handlePosition(weekNumber)}
        id="in"
      />
      <Card className={`w-full max-w-md p-5 border ${weekWorkoutCountFull ? 'border-red-500' : 'border-slate-950'} border-4 rounded-lg relative`}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Week {weekNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">Total Stress: {weeklyTotalStress}</p>
        </CardContent>
      </Card>
      {usedHandles.includes('out') && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="out"
        />
      )}
    </>
  );
}

export default WeekNode;
