import { useState } from 'react';

interface GlobalActionsMenuProps {
  onClearAll: () => void;
}

export default function GlobalActionsMenu({ onClearAll }: GlobalActionsMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
        aria-label="Global actions"
      >
        <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="4" cy="10" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="16" cy="10" r="1.5" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 30 }}
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu items */}
          <div
            className="absolute right-0 top-12 bg-white rounded-lg shadow-2xl border border-gray-200 py-1 min-w-[180px]"
            style={{ zIndex: 40 }}
          >
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onClearAll();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All Nodes
            </button>
          </div>
        </>
      )}
    </div>
  );
}
