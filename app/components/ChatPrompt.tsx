import { useEffect, useRef } from 'react';
import type { Fetcher } from 'react-router';

interface ChatPromptProps {
  fetcher: Fetcher;
  disabled?: boolean;
  lastNodeId?: string;
  noNodeSelected?: boolean;
}

export default function ChatPrompt({ fetcher, disabled, lastNodeId, noNodeSelected }: ChatPromptProps) {
  const isSubmitting = fetcher.state === 'submitting';
  const formRef = useRef<HTMLFormElement>(null);

  // Clear form after successful submission
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      formRef.current?.reset();
    }
  }, [fetcher.state, fetcher.data]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    fetcher.submit(formData, {
      method: 'POST',
      action: '/api/chat'
    });
  };

  const placeholder = noNodeSelected
    ? "Select a node to connect to, then enter your idea..."
    : "Enter your idea or question...";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
      {noNodeSelected && (
        <div className="max-w-4xl mx-auto mb-2 text-sm text-amber-600 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Click on a node to select it before creating a new idea
        </div>
      )}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto flex gap-3"
      >
        {lastNodeId && (
          <input type="hidden" name="lastNodeId" value={lastNodeId} />
        )}
        <input
          type="text"
          name="prompt"
          placeholder={placeholder}
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
      </form>
    </div>
  );
}