'use client';

import { Handle, Position } from '@xyflow/react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

function ParentNode() {
  return (
    <div>
      <Card className="w-full max-w-md p-5 border border-slate-950 border-4 rounded-lg relative">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Your workouts</CardTitle>
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
