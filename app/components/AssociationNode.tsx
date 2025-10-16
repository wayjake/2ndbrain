import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface AssociationNodeData {
  description: string;
  prevNodeData?: any;
  nextNodeData?: any;
}

function AssociationNode({ data }: NodeProps<AssociationNodeData>) {
  return (
    <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg shadow-md border-2 border-purple-400 min-w-[150px] max-w-[200px]">
      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-purple-400" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-purple-400" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-purple-400" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-purple-400" />

      {/* Node content */}
      <div className="p-3">
        <div className="text-xs font-semibold text-purple-700 mb-1">Association</div>
        <div className="text-xs text-gray-700">{data.description}</div>
      </div>
    </div>
  );
}

export default memo(AssociationNode);
