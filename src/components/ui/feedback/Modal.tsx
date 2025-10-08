import React, { useEffect } from 'react';
import { Button } from '../base/Button';
import './Modal.css';

let openModalCount = 0;
let previousBodyOverflow: string | null = null;

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
      openModalCount += 1;
      if (openModalCount === 1) {
        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      }
      
      // フォーカス管理
      const modalElement = document.querySelector('.modal-content') as HTMLElement;
      if (modalElement) {
        modalElement.focus();
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        openModalCount = Math.max(openModalCount - 1, 0);
        if (openModalCount === 0) {
          document.body.style.overflow = previousBodyOverflow ?? '';
          previousBodyOverflow = null;
        }
      };
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (!isOpen && openModalCount === 0) {
        document.body.style.overflow = previousBodyOverflow ?? '';
        previousBodyOverflow = null;
      }
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
              <Button
                className="modal-close-button"
                onClick={onClose}
                aria-label="モーダルを閉じる"
                icon="×"
                iconOnly
                size="small"
                variant="ghost"
              />
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
