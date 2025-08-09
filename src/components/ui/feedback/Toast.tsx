import React, { useEffect } from 'react';
import { Icon } from '../base/Icon';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: () => void }> = ({ 
  toast, 
  onRemove 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <Icon name="success" size="small" />;
      case 'error':
        return <Icon name="error" size="small" />;
      case 'warning':
        return <Icon name="warning" size="small" />;
      case 'info':
      default:
        return <Icon name="info" size="small" />;
    }
  };

  return (
    <div className={`toast-item toast-${toast.type}`}>
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={onRemove} aria-label="通知を閉じる">
        <Icon name="close" size="small" />
      </button>
    </div>
  );
};

export const Toast: React.FC<ToastProps> = ({ messages, onRemove }) => {
  if (messages.length === 0) return null;

  return (
    <div className="toast-container">
      {messages.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};