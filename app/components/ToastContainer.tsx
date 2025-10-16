import Toast, { type ToastProps } from './Toast';

export interface ToastData {
  id: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onDismiss={onDismiss}
          />
        </div>
      ))}
    </div>
  );
}
