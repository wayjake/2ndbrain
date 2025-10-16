import { useCallback, useEffect } from 'react';
import { useFetcher } from 'react-router';

interface UseNodeDeleteOptions {
  addToast: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export function useNodeDelete({ addToast }: UseNodeDeleteOptions) {
  const deleteFetcher = useFetcher();

  const handleDeleteNode = useCallback((nodeId: string) => {
    const formData = new FormData();
    formData.append('nodeId', nodeId);
    deleteFetcher.submit(formData, {
      method: 'POST',
      action: '/api/nodes/delete'
    });
  }, [deleteFetcher]);

  // Monitor fetcher state and fire toasts
  useEffect(() => {
    if (deleteFetcher.state === 'idle' && deleteFetcher.data) {
      if (deleteFetcher.data.error) {
        addToast(deleteFetcher.data.error, 'error');
      } else if (deleteFetcher.data.success) {
        addToast('Node deleted successfully', 'success');
      }
    }
  }, [deleteFetcher.state, deleteFetcher.data, addToast]);

  return { handleDeleteNode };
}
