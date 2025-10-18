import { useRef, useEffect } from 'react';
import type { Fetcher } from 'react-router';

interface CreateAttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentNodeId: string;
  fetcher: Fetcher;
}

export default function CreateAttributeModal({
  isOpen,
  onClose,
  parentNodeId,
  fetcher
}: CreateAttributeModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const isSubmitting = fetcher.state === 'submitting';

  // Close modal on successful submission
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      onClose();
    }
  }, [fetcher.state, fetcher.data, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('parentNodeId', parentNodeId);

    fetcher.submit(formData, {
      method: 'POST',
      action: '/api/attributes'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Attribute</h2>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-1">
                Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="key"
                name="key"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Status, Priority"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                Value <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="value"
                name="value"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Done, High"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Additional details about this attribute..."
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Attribute'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
