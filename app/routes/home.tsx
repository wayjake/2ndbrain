import { useState, useCallback } from 'react';
import type { Route } from "./+types/home";
import { useLoaderData } from 'react-router';
import IdeaFlowCanvas, { type IdeaNode, type AssociationNode as AssociationNodeType } from '../components/IdeaFlowCanvas';
import ChatPrompt from '../components/ChatPrompt';
import CreateAssociationModal from '../components/CreateAssociationModal';
import GlobalActionsMenu from '../components/GlobalActionsMenu';
import ConfirmModal from '../components/ConfirmModal';
import { type Edge, MarkerType, type Node } from '@xyflow/react';
import { getAllNodes, getAllEdges, getAllAssociations } from '../db/utils.server';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Idea Flow - Connect Your Ideas" },
    { name: "description", content: "Visual idea mapping with AI assistance" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const dbNodes = await getAllNodes();
  const dbEdges = await getAllEdges();
  const dbAssociations = await getAllAssociations();

  // Transform database nodes to React Flow nodes
  const ideaNodes: IdeaNode[] = dbNodes.map(node => ({
    id: node.id,
    type: 'idea',
    position: { x: node.positionX, y: node.positionY },
    data: {
      title: node.title,
      body: node.body,
      nextNodes: node.nextNodes ? JSON.parse(node.nextNodes) : [],
      prevNodes: node.prevNodes ? JSON.parse(node.prevNodes) : [],
      timestamp: node.timestamp
    }
  }));

  // Transform associations to React Flow nodes
  const associationNodes: AssociationNodeType[] = dbAssociations.map(assoc => {
    // Calculate position based on parent node position, vector, and distance
    const parentNode = dbNodes.find(n => n.id === assoc.parentNodeId);
    const parentX = parentNode?.positionX || 0;
    const parentY = parentNode?.positionY || 0;
    const angleRad = (assoc.vectorDirection * Math.PI) / 180;
    const positionX = parentX + Math.cos(angleRad) * assoc.distance;
    const positionY = parentY + Math.sin(angleRad) * assoc.distance;

    return {
      id: assoc.id,
      type: 'association',
      position: { x: positionX, y: positionY },
      draggable: false, // Associations can't be dragged independently
      data: {
        description: assoc.description,
        prevNodeData: assoc.prevNodeData ? JSON.parse(assoc.prevNodeData) : null,
        nextNodeData: assoc.nextNodeData ? JSON.parse(assoc.nextNodeData) : null,
        parentNodeId: assoc.parentNodeId,
        vectorDirection: assoc.vectorDirection,
        distance: assoc.distance
      }
    };
  });

  const allNodes = [...ideaNodes, ...associationNodes];

  // Transform database edges to React Flow edges
  const edges: Edge[] = dbEdges.map(edge => {
    const baseEdge = {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type === 'association' ? 'straight' : 'default',
      label: edge.label || undefined,
      style: { stroke: edge.type === 'association' ? '#9333ea' : '#10b981', strokeWidth: 2 }
    };

    // Only add arrow marker for non-association edges
    if (edge.type !== 'association') {
      return {
        ...baseEdge,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
      };
    }

    return baseEdge;
  });

  return { nodes: allNodes, edges };
}

export default function Home() {
  const { nodes: initialNodes, edges: initialEdges } = useLoaderData<typeof loader>();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNodeForAssociation, setSelectedNodeForAssociation] = useState<{ id: string; position: { x: number; y: number } } | null>(null);
  const [openMenuNodeId, setOpenMenuNodeId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleCreateAssociation = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setSelectedNodeForAssociation({ id: nodeId, position });
    setIsModalOpen(true);
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Node',
      message: 'Are you sure you want to delete this node? This will also delete all associated connections.',
      onConfirm: async () => {
        try {
          const response = await fetch('/api/nodes/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ nodeId })
          });

          if (response.ok) {
            // Remove the node and its associated edges from state
            setNodes(prev => prev.filter(n => n.id !== nodeId));
            setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
          }
        } catch (error) {
          console.error('Error deleting node:', error);
        }
      }
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear All Nodes',
      message: 'Are you sure you want to clear all nodes? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const response = await fetch('/api/nodes/clear', {
            method: 'POST',
          });

          if (response.ok) {
            // Clear all nodes and edges from state
            setNodes([]);
            setEdges([]);
          }
        } catch (error) {
          console.error('Error clearing all nodes:', error);
        }
      }
    });
  }, []);

  // Update association positions when parent nodes move
  const handleNodesWithAssociations = useCallback((updatedNodes: Node[]) => {
    const result = updatedNodes.map(node => {
      if (node.type === 'association') {
        // Find the parent node
        const assocNode = node as AssociationNodeType;
        const parentNode = updatedNodes.find(n => n.id === assocNode.data.parentNodeId);

        if (parentNode) {
          // Recalculate position based on parent's current position
          const angleRad = (assocNode.data.vectorDirection * Math.PI) / 180;
          const newX = parentNode.position.x + Math.cos(angleRad) * assocNode.data.distance;
          const newY = parentNode.position.y + Math.sin(angleRad) * assocNode.data.distance;

          return {
            ...node,
            position: { x: newX, y: newY }
          };
        }
      }
      return node;
    });

    setNodes(result);
  }, []);

  const handleAssociationCreated = useCallback((association: any) => {
    // Add association node
    const newNode: AssociationNodeType = {
      id: association.id,
      type: 'association',
      position: association.position,
      draggable: false, // Associations can't be dragged independently
      data: {
        description: association.description,
        prevNodeData: null,
        nextNodeData: null,
        parentNodeId: association.parentNodeId,
        vectorDirection: association.vectorDirection,
        distance: association.distance
      }
    };
    setNodes(prev => [...prev, newNode]);

    // Add edge without arrow marker
    const newEdge: Edge = {
      id: association.edgeId,
      source: association.parentNodeId,
      target: association.id,
      type: 'straight',
      style: { stroke: '#9333ea', strokeWidth: 2 }
    };
    setEdges(prev => [...prev, newEdge]);
  }, []);

  const handleChatResponse = useCallback((response: any) => {
    // Create a new node from the response
    const newNode: IdeaNode = {
      id: response.id || Date.now().toString(),
      type: 'idea',
      position: response.position || {
        x: 250 + (nodes.length * 50),
        y: 250 + (nodes.length * 30)
      },
      data: {
        title: response.title || 'New Idea',
        body: response.body || '',
        nextNodes: response.nextNodes || [],
        prevNodes: response.prevNodes || [],
        timestamp: response.timestamp || Date.now(),
        onCreateAssociation: () => handleCreateAssociation(response.id, response.position)
      }
    };

    // Add the new node
    setNodes(prev => [...prev, newNode]);

    // If there's a lastNodeId in the response, the edge was already created on the server
    // We just need to add it to the UI
    if (response.edgeCreated && nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      const newEdge: Edge = {
        id: `${lastNode.id}-${newNode.id}`,
        source: lastNode.id,
        target: newNode.id,
        type: 'default',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        label: 'follows',
        style: { stroke: '#10b981', strokeWidth: 2 }
      };
      setEdges(prev => [...prev, newEdge]);
    }
  }, [nodes, handleCreateAssociation]);

  // Attach callbacks to all idea nodes
  const nodesWithCallbacks = nodes.map(node => {
    if (node.type === 'idea') {
      return {
        ...node,
        data: {
          ...node.data,
          onCreateAssociation: () => handleCreateAssociation(node.id, node.position),
          onDeleteNode: () => handleDeleteNode(node.id),
          isMenuOpen: openMenuNodeId === node.id,
          onMenuToggle: () => setOpenMenuNodeId(openMenuNodeId === node.id ? null : node.id)
        }
      };
    }
    return node;
  }); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Idea Flow</h1>
            <p className="text-sm text-gray-600">Connect and organize your ideas visually</p>
          </div>
          <GlobalActionsMenu onClearAll={handleClearAll} />
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="absolute inset-0 pt-16 pb-20">
        <IdeaFlowCanvas
          nodes={nodesWithCallbacks}
          edges={edges}
          onNodesChange={handleNodesWithAssociations}
          onEdgesChange={setEdges}
          onPaneClick={() => setOpenMenuNodeId(null)}
        />
      </div>

      {/* Chat Prompt at Bottom */}
      <ChatPrompt
        onResponse={handleChatResponse}
        lastNodeId={nodes.length > 0 ? nodes[nodes.length - 1].id : undefined}
      />

      {/* Create Association Modal */}
      {selectedNodeForAssociation && (
        <CreateAssociationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedNodeForAssociation(null);
          }}
          parentNodeId={selectedNodeForAssociation.id}
          parentNodePosition={selectedNodeForAssociation.position}
          onAssociationCreated={handleAssociationCreated}
        />
      )}

      {/* Node Count Indicator */}
      {nodes.length > 0 && (
        <div className="absolute top-20 right-4 bg-white rounded-lg shadow-md px-3 py-2 z-40">
          <span className="text-sm text-gray-600">
            {nodes.length} {nodes.length === 1 ? 'idea' : 'ideas'}
          </span>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Delete"
        confirmStyle="danger"
      />
    </div>
  );
}