import { useEffect } from 'react';
import { useFetcher } from 'react-router';

interface UseIdeaChatOptions {
  addToast: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export function useIdeaChat({ addToast }: UseIdeaChatOptions) {
  const chatFetcher = useFetcher();

  // Monitor fetcher state and fire toasts
  useEffect(() => {
    if (chatFetcher.state === 'idle' && chatFetcher.data) {
      if (chatFetcher.data.error) {
        addToast(chatFetcher.data.error, 'error');
      } else if (chatFetcher.data.success) {
        addToast('Idea created successfully', 'success');
      }
    }
  }, [chatFetcher.state, chatFetcher.data, addToast]);

  return { chatFetcher };
}
