'use client';

import { Handle, NodeProps, Position, Node as FlowNode } from '@xyflow/react';
import CustomNode from './customNode';
import { NodeDataSchema, FlowNodeType } from '@/app/zod/types';
import { z } from 'zod';

type NodeData = z.infer<typeof NodeDataSchema>;

// Extend the FlowNode type with our custom data
type CustomNodeProps = Omit<FlowNode, 'data'> & {
  data: NodeData;
  type: FlowNodeType;
};

function HillsDisplayNode({ data }: NodeProps<CustomNodeProps>) {
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
