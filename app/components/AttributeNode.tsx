import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface AttributeNodeData {
  value: string;
  attributeKey: string;
  parentNodeId: string;
}

function AttributeNode({ data }: NodeProps<AttributeNodeData>) {
  return (
    <div className="relative">
      {/* Handle for connection to parent node */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-red-500 opacity-0"
      />

      {/* Red circle with value */}
      <div className="w-16 h-16 rounded-full bg-red-500 shadow-lg flex items-center justify-center border-2 border-red-600">
        <div className="text-white text-xs font-semibold text-center px-2 break-words">
          {data.value}
        </div>
      </div>
    </div>
  );
}

export default memo(AttributeNode);
