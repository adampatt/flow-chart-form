'use client';

import { Handle, NodeProps, Position } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

function WeekNode({ data }: NodeProps) {
  const { weekNumber, weeklyTotalStress, usedHandles, total_times_per_week, weekWorkoutCountFull } = data;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
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
