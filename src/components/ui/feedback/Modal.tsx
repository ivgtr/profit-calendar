import React, { useEffect } from 'react';
import './Modal.css';

export type ModalSize = 'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: ModalSize;
  className?: string;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  preventEscapeWhenEditing?: boolean;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  className = '',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  preventEscapeWhenEditing = false,
  footer
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        // preventEscapeWhenEditingが有効な場合、ESCキーでモーダルを閉じない
        if (preventEscapeWhenEditing) {
          return;
        }
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      // フォーカス管理
      const modalElement = document.querySelector('.modal-content') as HTMLElement;
      if (modalElement) {
        modalElement.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, closeOnEscape, preventEscapeWhenEditing]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalClasses = [
    'modal-content',
    size,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div 
        className={modalClasses}
        tabIndex={-1}
        role="document"
      >
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {showCloseButton && (
              <button
                className="modal-close-button"
                onClick={onClose}
                aria-label="モーダルを閉じる"
                type="button"
              >
                ×
              </button>
            )}
          </div>
        )}
        
        <div className="modal-body">
          {children}
        </div>

        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};