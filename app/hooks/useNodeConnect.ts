import { useCallback, useEffect } from 'react';
import { useFetcher } from 'react-router';
import type { Connection } from '@xyflow/react';
import type { IdeaNode } from '../components/IdeaFlowCanvas';
import type { Node } from '@xyflow/react';

interface UseNodeConnectOptions {
  nodes: Node[];
  addToast: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export function useNodeConnect({ nodes, addToast }: UseNodeConnectOptions) {
  const connectFetcher = useFetcher();

  const handleConnect = useCallback((connection: Connection) => {
    // Find source and target nodes
    const sourceNode = nodes.find(n => n.id === connection.source) as IdeaNode | undefined;
    const targetNode = nodes.find(n => n.id === connection.target) as IdeaNode | undefined;

    // Only allow connections between idea nodes
    if (!sourceNode || !targetNode || sourceNode.type !== 'idea' || targetNode.type !== 'idea') {
      addToast('Can only connect idea nodes', 'warning');
      return;
    }

    // Check if source already has a nextNode
    if (sourceNode.data.nextNode) {
      addToast('Source node already has a next connection', 'warning');
      return;
    }

    // Check if target already has a prevNode
    if (targetNode.data.prevNode) {
      addToast('Target node already has a previous connection', 'warning');
      return;
    }

    // Submit connection via fetcher
    connectFetcher.submit(
      { sourceId: connection.source as string, targetId: connection.target as string },
      { method: 'POST', action: '/api/nodes/connect', encType: 'application/json' }
    );
  }, [nodes, addToast, connectFetcher]);

  // Monitor fetcher state and fire toasts
  useEffect(() => {
    if (connectFetcher.state === 'idle' && connectFetcher.data) {
      if (connectFetcher.data.error) {
        addToast(connectFetcher.data.error, 'error');
      } else if (connectFetcher.data.success) {
        addToast('Nodes connected successfully', 'success');
      }
    }
  }, [connectFetcher.state, connectFetcher.data, addToast]);

  return { handleConnect };
}
