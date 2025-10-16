import { useEffect, useRef } from 'react';
import { useFetcher } from 'react-router';

interface ChatPromptProps {
  onResponse: (response: any) => void;
  disabled?: boolean;
  lastNodeId?: string;
}

export default function ChatPrompt({ onResponse, disabled, lastNodeId }: ChatPromptProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === 'submitting';
  const processedRef = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Handle response when it comes back
  useEffect(() => {
    if (fetcher.data && fetcher.state === 'idle') {
      const responseId = fetcher.data.id || JSON.stringify(fetcher.data);
      // Only process if we haven't seen this response before
      if (processedRef.current !== responseId) {
        processedRef.current = responseId;
        onResponse(fetcher.data);
        // Clear the form after successful submission
        formRef.current?.reset();
      }
    }
  }, [fetcher.data, fetcher.state, onResponse]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
      <fetcher.Form
        ref={formRef}
        method="post"
        action="/api/chat"
        className="max-w-4xl mx-auto flex gap-3"
      >
        {lastNodeId && (
          <input type="hidden" name="lastNodeId" value={lastNodeId} />
        )}
        <input
          type="text"
          name="prompt"
          placeholder="Enter your idea or question..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={isSubmitting || disabled}
          required
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          disabled={isSubmitting || disabled}
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </button>
      </fetcher.Form>
    </div>
  );
}