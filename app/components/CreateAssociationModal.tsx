import { useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';

interface CreateAssociationModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentNodeId: string;
  parentNodePosition: { x: number; y: number };
  onAssociationCreated: (association: any) => void;
}

export default function CreateAssociationModal({
  isOpen,
  onClose,
  parentNodeId,
  parentNodePosition,
  onAssociationCreated
}: CreateAssociationModalProps) {
  const fetcher = useFetcher();
  const [description, setDescription] = useState('');
  const [vectorDirection, setVectorDirection] = useState(0);
  const [distance, setDistance] = useState(150);
  const formRef = useRef<HTMLFormElement>(null);
  const processedRef = useRef<string | null>(null);

  // Handle response when association is created
  useEffect(() => {
    if (fetcher.data && fetcher.state === 'idle') {
      const responseId = fetcher.data.id || JSON.stringify(fetcher.data);
      if (processedRef.current !== responseId) {
        processedRef.current = responseId;
        onAssociationCreated(fetcher.data);
        onClose();
        // Reset form
        setDescription('');
        setVectorDirection(0);
        setDistance(150);
      }
    }
  }, [fetcher.data, fetcher.state, onAssociationCreated, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Create Association</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <fetcher.Form
          ref={formRef}
          method="post"
          action="/api/associations"
          className="space-y-4"
        >
          <input type="hidden" name="parentNodeId" value={parentNodeId} />
          <input type="hidden" name="parentNodeX" value={parentNodePosition.x} />
          <input type="hidden" name="parentNodeY" value={parentNodePosition.y} />

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this association..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          {/* Vector Direction */}
          <div>
            <label htmlFor="vectorDirection" className="block text-sm font-medium text-gray-700 mb-2">
              Direction: {vectorDirection}°
            </label>
            <input
              type="range"
              id="vectorDirection"
              name="vectorDirection"
              min="0"
              max="360"
              value={vectorDirection}
              onChange={(e) => setVectorDirection(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0° (Right)</span>
              <span>90° (Down)</span>
              <span>180° (Left)</span>
              <span>270° (Up)</span>
            </div>
          </div>

          {/* Distance */}
          <div>
            <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-2">
              Distance: {distance}px
            </label>
            <input
              type="range"
              id="distance"
              name="distance"
              min="50"
              max="300"
              step="10"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Preview visualization */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-2">Preview:</p>
            <div className="relative w-full h-32 bg-white rounded border border-gray-200">
              <div
                className="absolute w-3 h-3 bg-blue-500 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
              <div
                className="absolute w-3 h-3 bg-green-500 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${Math.cos((vectorDirection * Math.PI) / 180) * (distance / 3)}px, ${Math.sin((vectorDirection * Math.PI) / 180) * (distance / 3)}px)`
                }}
              />
              <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                <line
                  x1="50%"
                  y1="50%"
                  x2={`calc(50% + ${Math.cos((vectorDirection * Math.PI) / 180) * (distance / 3)}px)`}
                  y2={`calc(50% + ${Math.sin((vectorDirection * Math.PI) / 180) * (distance / 3)}px)`}
                  stroke="#9CA3AF"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
              </svg>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!description.trim() || fetcher.state === 'submitting'}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {fetcher.state === 'submitting' ? 'Creating...' : 'Create'}
            </button>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
}
