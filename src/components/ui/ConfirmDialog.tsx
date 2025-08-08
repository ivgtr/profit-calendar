import React from 'react';
import { Modal } from './Modal';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = '確認',
  message,
  confirmText = 'OK',
  cancelText = 'キャンセル',
  variant = 'default'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="confirm-dialog">
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={`confirm-ok ${variant === 'danger' ? 'confirm-danger' : ''}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};