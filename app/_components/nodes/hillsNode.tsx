'use client';

import { Handle, NodeProps, Position } from '@xyflow/react';
import CustomNode from './customNode';

function HillsDisplayNode({ data }: NodeProps) {
  return (
    <div>
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
    </div>
  );
}

export default HillsDisplayNode;
