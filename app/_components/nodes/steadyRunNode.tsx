'use client';

import { Handle, NodeProps, Position } from '@xyflow/react';
import CustomNode from './customNode';
import { WorkoutNodeSchema } from '@/app/zod/types';

function SteadyRunNode({ data }: NodeProps<WorkoutNodeSchema>) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
      />
      <CustomNode data={data} />
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
      />
    </>
  );
}

export default SteadyRunNode;
