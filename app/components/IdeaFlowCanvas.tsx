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
import AssociationNodeComponent from './AssociationNode';

export interface IdeaNode extends Node {
  type: 'idea';
  data: {
    title: string;
    body: string;
    nextNodes?: string[];
    prevNodes?: string[];
    timestamp: number;
    onCreateAssociation?: () => void;
    onDeleteNode?: () => void;
    isMenuOpen?: boolean;
    onMenuToggle?: () => void;
  };
}

export interface AssociationNode extends Node {
  type: 'association';
  data: {
    description: string;
    prevNodeData?: any;
    nextNodeData?: any;
    parentNodeId: string;
    vectorDirection: number;
    distance: number;
  };
}

const nodeTypes = {
  idea: IdeaNodeComponent,
  association: AssociationNodeComponent
};

export default function IdeaFlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onPaneClick
}: {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onPaneClick?: () => void;
}) {
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(applyNodeChanges(changes, nodes));
  }, [nodes, onNodesChange]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(applyEdgeChanges(changes, edges));
  }, [edges, onEdgesChange]);

  const onConnect = useCallback((connection: Connection) => {
    onEdgesChange(addEdge({
      ...connection,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
      },
      style: { stroke: '#10b981', strokeWidth: 2 }
    }, edges));
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