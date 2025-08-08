import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastMessage, ToastType } from '../components/ui/Toast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

interface AlertOptions {
  title?: string;
  message: string;
  confirmText?: string;
}

interface UIContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
  showAlert: (options: AlertOptions | string) => Promise<void>;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    options: AlertOptions;
    resolve: () => void;
  } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        options,
        resolve
      });
    });
  }, []);

  const showAlert = useCallback((options: AlertOptions | string): Promise<void> => {
    const alertOptions: AlertOptions = typeof options === 'string' 
      ? { message: options }
      : options;
      
    return new Promise((resolve) => {
      setAlertDialog({
        isOpen: true,
        options: alertOptions,
        resolve
      });
    });
  }, []);

  const handleConfirm = () => {
    if (confirmDialog) {
      confirmDialog.resolve(true);
      setConfirmDialog(null);
    }
  };

  const handleCancel = () => {
    if (confirmDialog) {
      confirmDialog.resolve(false);
      setConfirmDialog(null);
    }
  };

  const handleAlertClose = () => {
    if (alertDialog) {
      alertDialog.resolve();
      setAlertDialog(null);
    }
  };

  return (
    <UIContext.Provider value={{ showToast, showConfirm, showAlert }}>
      {children}
      <Toast messages={toasts} onRemove={removeToast} />
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          {...confirmDialog.options}
        />
      )}
      {alertDialog && (
        <Modal 
          isOpen={alertDialog.isOpen} 
          onClose={handleAlertClose}
          title={alertDialog.options.title || '通知'}
        >
          <div style={{ paddingBottom: '1rem' }}>
            <p style={{ margin: 0, lineHeight: 1.5 }}>{alertDialog.options.message}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleAlertClose}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontWeight: 500,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: 'var(--color-primary, #007bff)',
                color: 'white'
              }}
            >
              {alertDialog.options.confirmText || 'OK'}
            </button>
          </div>
        </Modal>
      )}
    </UIContext.Provider>
  );
};