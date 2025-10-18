import { useCallback, useEffect } from 'react';
import { useFetcher } from 'react-router';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  confirmStyle?: 'danger' | 'primary';
  onConfirm: () => void;
}

interface UseNodeDeleteOptions {
  addToast: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  confirm: (options: ConfirmOptions) => void;
}

export function useNodeDelete({ addToast, confirm }: UseNodeDeleteOptions) {
  const deleteFetcher = useFetcher();

  const handleDeleteNode = useCallback((nodeId: string) => {
    confirm({
      title: 'Delete Node',
      message: 'Are you sure you want to delete this node? This will also delete all associated connections.',
      confirmText: 'Delete',
      confirmStyle: 'danger',
      onConfirm: () => {
        const formData = new FormData();
        formData.append('nodeId', nodeId);
        deleteFetcher.submit(formData, {
          method: 'POST',
          action: '/api/nodes/delete'
        });
      }
    });
  }, [confirm, deleteFetcher]);

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
