import { useState, useCallback, useEffect } from 'react';
import type { Route } from "./+types/home";
import { useLoaderData, useFetcher } from 'react-router';
import IdeaFlowCanvas, { type IdeaNode } from '../components/IdeaFlowCanvas';
import ChatPrompt from '../components/ChatPrompt';
import GlobalActionsMenu from '../components/GlobalActionsMenu';
import ToastContainer from '../components/ToastContainer';
import CreateAttributeModal from '../components/CreateAttributeModal';
import { type Edge, MarkerType, type Node, type Connection } from '@xyflow/react';
import { getAllNodes, getAllAttributes } from '../db/utils.server';
import { useToast } from '../hooks/useToast';
import { useNodeConnect } from '../hooks/useNodeConnect';
import { useClearAll } from '../hooks/useClearAll';
import { useNodeDelete } from '../hooks/useNodeDelete';
import { useIdeaChat } from '../hooks/useIdeaChat';
import { useConfirmModal } from '../hooks/useConfirmModal';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Idea Flow - Connect Your Ideas" },
    { name: "description", content: "Visual idea mapping with AI assistance" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const dbNodes = await getAllNodes();

  // Helper function to estimate node height based on content
  const estimateNodeHeight = (title: string, body: string): number => {
    const baseHeight = 60; // Base padding, borders, handles, etc.
    const maxWidth = 250; // max-w-[250px] from IdeaNode
    const avgCharWidth = 7; // Approximate character width in pixels

    // Calculate title height (font-semibold text-sm)
    const titleCharsPerLine = Math.floor(maxWidth / avgCharWidth);
    const titleLines = Math.ceil(title.length / titleCharsPerLine);
    const titleHeight = titleLines * 20; // 20px line height

    // Calculate body height (text-xs)
    const bodyCharsPerLine = Math.floor(maxWidth / (avgCharWidth * 0.85)); // Smaller font
    const bodyLines = Math.ceil(body.length / bodyCharsPerLine);
    const bodyHeight = bodyLines * 18; // 18px line height

    return baseHeight + titleHeight + bodyHeight;
  };

  // Calculate positions for nodes in linear order
  const nodePositions = new Map<string, { x: number; y: number }>();

  // Find the head node (no prevNode)
  const headNode = dbNodes.find(n => !n.prevNode);

  console.log('[LOADER] Node chain analysis:', {
    totalNodes: dbNodes.length,
    headNode: headNode ? { id: headNode.id, title: headNode.title } : null,
    allNodesPrevNext: dbNodes.map(n => ({ id: n.id, prevNode: n.prevNode, nextNode: n.nextNode }))
  });

  if (headNode) {
    // Start position
    let currentY = 100;
    const centerX = 400;

    // Walk the chain from head to tail
    let currentNode: typeof headNode | null = headNode;
    let chainLength = 0;
    while (currentNode) {
      nodePositions.set(currentNode.id, { x: centerX, y: currentY });
      console.log(`[LOADER] Positioned node ${currentNode.id} at (${centerX}, ${currentY})`);
      chainLength++;

      // Calculate height of current node for spacing
      const nodeHeight = estimateNodeHeight(currentNode.title, currentNode.body);
      currentY += nodeHeight + 50; // 50px spacing between nodes

      // Move to next node in chain
      if (currentNode.nextNode) {
        const nextNodeId: string = currentNode.nextNode;
        currentNode = dbNodes.find(n => n.id === nextNodeId) ?? null;
      } else {
        break;
      }
    }
    console.log(`[LOADER] Positioned ${chainLength} nodes in chain`);
  }

  // Transform database nodes to React Flow nodes with calculated positions
  const ideaNodes: IdeaNode[] = dbNodes.map(node => {
    const position = nodePositions.get(node.id) || { x: 400, y: 100 };
    console.log(`[LOADER] Node ${node.id} final position:`, position, `(was in map: ${nodePositions.has(node.id)})`);
    return {
      id: node.id,
      type: 'idea',
      position,
      data: {
        title: node.title,
        body: node.body,
        nextNode: node.nextNode || null,
        prevNode: node.prevNode || null,
        timestamp: node.timestamp
      }
    };
  });

  // Create edges based on nextNode relationships in nodes
  const edges = dbNodes
    .filter(node => node.nextNode)
    .map(node => ({
      id: `${node.id}-${node.nextNode}`,
      source: node.id,
      target: node.nextNode!,
      type: 'default' as const,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
      },
      label: 'next',
      style: { stroke: '#10b981', strokeWidth: 2 }
    })) as Edge[];

  // Fetch all attributes
  const dbAttributes = await getAllAttributes();

  // Group attributes by parent node
  const attributesByNode = new Map<string, typeof dbAttributes>();
  for (const attr of dbAttributes) {
    if (!attributesByNode.has(attr.nodeId)) {
      attributesByNode.set(attr.nodeId, []);
    }
    attributesByNode.get(attr.nodeId)!.push(attr);
  }

  // Create attribute nodes with positioning
  const attributeNodes: Node[] = [];
  const attributeEdges: Edge[] = [];

  attributesByNode.forEach((attributes, parentNodeId) => {
    const parentPosition = nodePositions.get(parentNodeId);
    if (!parentPosition) return;

    attributes.forEach((attr, index) => {
      // Alternate left (odd) and right (even) sides
      const isRight = index % 2 === 0;
      const side = isRight ? 1 : -1;
      const horizontalOffset = 150;

      // Calculate position
      const attributeX = parentPosition.x + (side * horizontalOffset);
      const attributeY = parentPosition.y + (Math.floor(index / 2) * 80);

      // Create attribute node
      attributeNodes.push({
        id: attr.id,
        type: 'attribute',
        position: { x: attributeX, y: attributeY },
        data: {
          value: attr.value,
          attributeKey: attr.key,
          parentNodeId: attr.nodeId
        }
      });

      // Create edge connecting attribute to parent
      attributeEdges.push({
        id: `attr-edge-${attr.id}`,
        source: parentNodeId,
        target: attr.id,
        type: 'default',
        label: attr.key,
        style: { stroke: '#ef4444', strokeWidth: 2 },
        markerEnd: undefined
      } as Edge);
    });
  });

  // Combine all nodes and edges
  const allNodes = [...ideaNodes, ...attributeNodes];
  const allEdges = [...edges, ...attributeEdges];

  return { nodes: allNodes, edges: allEdges };
}

export default function Home() {
  const { nodes: initialNodes, edges: initialEdges } = useLoaderData<typeof loader>();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge<any>[]>(initialEdges as Edge<any>[]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [openMenuNodeId, setOpenMenuNodeId] = useState<string | null>(null);
  const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
  const [selectedNodeForAttribute, setSelectedNodeForAttribute] = useState<string | null>(null);

  // Custom hooks
  const { toasts, addToast, dismissToast } = useToast();
  const { confirm, ConfirmModal } = useConfirmModal();
  const { handleConnect } = useNodeConnect({ nodes, addToast });
  const { handleClearAll } = useClearAll({ addToast, confirm });
  const { handleDeleteNode } = useNodeDelete({ addToast, confirm });
  const { chatFetcher } = useIdeaChat({ addToast });

  // Attribute creation fetcher
  const attributeFetcher = useFetcher();

  // Update local state when loader data changes (after revalidation)
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges as Edge<any>[]);
  }, [initialNodes, initialEdges]);

  // Handle attribute creation success
  useEffect(() => {
    if (attributeFetcher.state === 'idle' && attributeFetcher.data?.success) {
      addToast('Attribute added successfully', 'success');
      setIsAttributeModalOpen(false);
      setSelectedNodeForAttribute(null);
    }
  }, [attributeFetcher.state, attributeFetcher.data, addToast]);

  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setOpenMenuNodeId(null); // Close any open menus
  }, []);

  const handleCreateAttribute = useCallback((nodeId: string) => {
    setSelectedNodeForAttribute(nodeId);
    setIsAttributeModalOpen(true);
    setOpenMenuNodeId(null); // Close any open menus
  }, []);

  const handleNodesChange = useCallback((updatedNodes: Node[]) => {
    setNodes(updatedNodes);
  }, []);

  // Attach callbacks to all idea nodes
  const nodesWithCallbacks = nodes.map(node => {
    if (node.type === 'idea') {
      return {
        ...node,
        data: {
          ...node.data,
          onDeleteNode: () => handleDeleteNode(node.id),
          onSelect: () => handleNodeSelect(node.id),
          onCreateAttribute: () => handleCreateAttribute(node.id),
          isSelected: selectedNodeId === node.id,
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
          onNodesChange={handleNodesChange}
          onEdgesChange={setEdges}
          onConnect={handleConnect}
          onPaneClick={() => {
            setOpenMenuNodeId(null);
            setSelectedNodeId(null);
          }}
        />
      </div>

      {/* Chat Prompt at Bottom */}
      <ChatPrompt
        fetcher={chatFetcher}
        lastNodeId={selectedNodeId || undefined}
        disabled={nodes.filter(n => n.type === 'idea').length > 0 && !selectedNodeId}
        noNodeSelected={nodes.filter(n => n.type === 'idea').length > 0 && !selectedNodeId}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Node Count Indicator */}
      {nodes.length > 0 && (
        <div className="absolute top-20 right-4 bg-white rounded-lg shadow-md px-3 py-2 z-40">
          <span className="text-sm text-gray-600">
            {nodes.length} {nodes.length === 1 ? 'idea' : 'ideas'}
          </span>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal />

      {/* Create Attribute Modal */}
      {selectedNodeForAttribute && (
        <CreateAttributeModal
          isOpen={isAttributeModalOpen}
          onClose={() => {
            setIsAttributeModalOpen(false);
            setSelectedNodeForAttribute(null);
          }}
          parentNodeId={selectedNodeForAttribute}
          fetcher={attributeFetcher}
        />
      )}
    </div>
  );
}