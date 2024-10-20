'use client';

import { Handle, NodeProps, Position } from '@xyflow/react';
import CustomNode from './customNode';

function tempoRunNode(props: NodeProps) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
      />
      <CustomNode data={props.data} />
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
      />
    </>
  );
}

export default tempoRunNode;
