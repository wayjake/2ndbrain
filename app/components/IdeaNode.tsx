import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface IdeaNodeData {
  title: string;
  body: string;
  onDeleteNode?: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
  isMenuOpen?: boolean;
  onMenuToggle?: () => void;
}

function IdeaNode({ data }: NodeProps<IdeaNodeData>) {
  const isMenuOpen = data.isMenuOpen ?? false;
  const isSelected = data.isSelected ?? false;

  const borderClass = isSelected
    ? "border-emerald-500 ring-4 ring-emerald-200"
    : "border-blue-500 hover:border-blue-600";

  return (
    <div
      className={`bg-white rounded-lg shadow-md border-2 ${borderClass} min-w-[200px] max-w-[250px] relative cursor-pointer transition-all`}
      onClick={(e) => {
        e.stopPropagation();
        data.onSelect?.();
      }}
    >
      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />

      {/* Node content */}
      <div className="p-3">
        {/* Header with menu */}
        <div className="flex items-start justify-between mb-1">
          <div className="font-semibold text-gray-800 text-sm flex-1 pr-2">{data.title}</div>

          {/* Dropdown menu button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onMenuToggle?.();
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              aria-label="Node actions"
            >
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="4" cy="10" r="1.5" />
                <circle cx="10" cy="10" r="1.5" />
                <circle cx="16" cy="10" r="1.5" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {isMenuOpen && (
              <div
                className="absolute right-0 top-6 bg-white rounded-lg shadow-2xl border border-gray-200 py-1 min-w-[150px]"
                style={{ zIndex: 1000 }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    data.onDeleteNode?.();
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Node
                </button>
              </div>
            )}
          </div>
        </div>

        {data.body && (
          <div className="text-xs text-gray-600">{data.body}</div>
        )}
      </div>
    </div>
  );
}

export default memo(IdeaNode);
