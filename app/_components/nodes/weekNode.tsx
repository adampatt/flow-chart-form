'use client';

import { Handle, NodeProps, Position } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface WeekNodeProps {
  data: {
    weekNumber: number;
    totalStress: number;
    usedHandles: string[];
  };
  style?: React.CSSProperties;
}

function WeekNode({ data }: NodeProps) {
  const { weekNumber, totalStress, usedHandles } = data;

  return (
    <>
      <Card className="w-full max-w-md p-5 border border-slate-950 border-4 rounded-lg relative">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Week {weekNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">Total Stress: {totalStress}</p>
        </CardContent>
      </Card>
      <Handle
        type="target"
        position={Position.Top}
        id="in"
      />
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
