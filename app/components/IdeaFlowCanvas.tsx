import { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
  BackgroundVariant,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import IdeaNodeComponent from './IdeaNode';

export interface IdeaNode extends Node {
  type: 'idea';
  data: {
    title: string;
    body: string;
    nextNode?: string | null;
    prevNode?: string | null;
    timestamp: number;
    onDeleteNode?: () => void;
    onSelect?: () => void;
    isSelected?: boolean;
    isMenuOpen?: boolean;
    onMenuToggle?: () => void;
  };
}

const nodeTypes = {
  idea: IdeaNodeComponent
};

export default function IdeaFlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onPaneClick
}: {
  nodes: Node[];
  edges: Edge<any>[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge<any>[]) => void;
  onConnect: (connection: Connection) => void;
  onPaneClick?: () => void;
}) {
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(applyNodeChanges(changes, nodes));
  }, [nodes, onNodesChange]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(applyEdgeChanges(changes, edges));
  }, [edges, onEdgesChange]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}