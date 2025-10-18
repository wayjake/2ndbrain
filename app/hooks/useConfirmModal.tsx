import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  confirmStyle?: 'danger' | 'primary';
  onConfirm: () => void;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  confirmStyle: 'danger' | 'primary';
  onConfirm: () => void;
}

export function useConfirmModal() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    confirmStyle: 'primary',
    onConfirm: () => {},
  });

  const confirm = useCallback((options: ConfirmOptions) => {
    setModalState({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'Confirm',
      confirmStyle: options.confirmStyle || 'primary',
      onConfirm: options.onConfirm,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    modalState.onConfirm();
    closeModal();
  }, [modalState.onConfirm, closeModal]);

  const ConfirmModal = useCallback(() => {
    if (!modalState.isOpen) return null;

    const confirmButtonClass = modalState.confirmStyle === 'danger'
      ? 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors'
      : 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {modalState.title}
            </h3>
            <p className="text-gray-600 mb-6">
              {modalState.message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={confirmButtonClass}
              >
                {modalState.confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [modalState, closeModal, handleConfirm]);

  return {
    confirm,
    ConfirmModal
  };
}
