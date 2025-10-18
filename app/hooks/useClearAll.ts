import { useCallback, useEffect } from 'react';
import { useFetcher } from 'react-router';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  confirmStyle?: 'danger' | 'primary';
  onConfirm: () => void;
}

interface ClearAllOptions {
  addToast: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  confirm: (options: ConfirmOptions) => void;
}

export function useClearAll({ addToast, confirm }: ClearAllOptions) {
  const clearFetcher = useFetcher();

  const handleClearAll = useCallback(() => {
    confirm({
      title: 'Clear All Nodes',
      message: 'Are you sure you want to clear all nodes? This action cannot be undone.',
      confirmText: 'Clear All',
      confirmStyle: 'danger',
      onConfirm: () => {
        clearFetcher.submit({}, {
          method: 'POST',
          action: '/api/nodes/clear'
        });
      }
    });
  }, [confirm, clearFetcher]);

  // Monitor fetcher state and fire toasts
  useEffect(() => {
    if (clearFetcher.state === 'idle' && clearFetcher.data) {
      if (clearFetcher.data.error) {
        addToast(clearFetcher.data.error, 'error');
      } else if (clearFetcher.data.success) {
        addToast('All nodes cleared', 'success');
      }
    }
  }, [clearFetcher.state, clearFetcher.data, addToast]);

  return {
    handleClearAll
  };
}
