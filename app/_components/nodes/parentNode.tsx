'use client';

import { Handle, NodeProps, Position } from '@xyflow/react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { defaultStressScore } from '../../zod/types';

function ParentNode(props: NodeProps) {
  const { data } = props;
  return (
    <div>
      <Card className="w-full max-w-md p-5 border border-slate-950 border-4 rounded-lg relative">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Your workouts</CardTitle>
          <CardDescription>
            You selected {data?.userStressScore ?? ''} as your fitness level. Because of this each week you will be set workouts that are tough enough
            to give you a total stress score of {defaultStressScore[data?.userStressScore ?? 30]} or less. You can add or remove workouts, but will
            not be able to exceed this total.
          </CardDescription>
        </CardHeader>
      </Card>
      <Handle
        type="source"
        position={Position.Left}
        id="a"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={{ left: '33%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="c"
        style={{ right: '66%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="d"
      />
    </div>
  );
}

export default ParentNode;
