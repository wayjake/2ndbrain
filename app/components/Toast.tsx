import { useEffect } from 'react';
import { cn } from '../utils/cn';

export interface ToastProps {
  id: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  onDismiss: (id: string) => void;
}

export default function Toast({ id, message, type = 'info', onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 4200);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const bgColor = {
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    success: 'bg-green-500'
  }[type];

  return (
    <div
      className={cn(
        bgColor,
        "text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3",
        "min-w-[300px] max-w-[400px]",
        "animate-in slide-in-from-right duration-300"
      )}
    >
      <span className="text-sm">{message}</span>
      <button
        onClick={() => onDismiss(id)}
        className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
