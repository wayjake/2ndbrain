import { useCallback, useEffect } from 'react';
import { useFetcher } from 'react-router';

interface ClearAllOptions {
  addToast: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export function useClearAll({ addToast }: ClearAllOptions) {
  const clearFetcher = useFetcher();

  const executeClearAll = useCallback(() => {
    clearFetcher.submit({}, {
      method: 'POST',
      action: '/api/nodes/clear'
    });
  }, [clearFetcher]);

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
    executeClearAll
  };
}
