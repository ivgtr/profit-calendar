import React, { useEffect, useRef } from 'react';
import { Button } from '../base/Button';
import './Modal.css';

let openModalCount = 0;
let previousBodyOverflow: string | null = null;

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

const isElementVisible = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  return style.visibility !== 'hidden' && style.display !== 'none';
};

const getFocusableElements = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden') && isElementVisible(el));

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
  const modalRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (!closeOnEscape || event.key !== 'Escape') {
        return;
      }
      if (preventEscapeWhenEditing) {
        return;
      }
      onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      openModalCount += 1;
      if (openModalCount === 1) {
        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (isOpen) {
        openModalCount = Math.max(openModalCount - 1, 0);
        if (openModalCount === 0) {
          document.body.style.overflow = previousBodyOverflow ?? '';
          previousBodyOverflow = null;
        }
      }
    };
  }, [isOpen, onClose, closeOnEscape, preventEscapeWhenEditing]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const modalElement = modalRef.current;
    if (!modalElement) {
      return;
    }

    lastFocusedElementRef.current = document.activeElement as HTMLElement | null;

    const focusInitialElement = () => {
      const focusableElements = getFocusableElements(modalElement);
      (focusableElements[0] || modalElement).focus();
    };

    focusInitialElement();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements(modalElement);
      if (focusableElements.length === 0) {
        event.preventDefault();
        modalElement.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const currentFocused = document.activeElement as HTMLElement | null;

      if (!event.shiftKey && currentFocused === lastElement) {
        event.preventDefault();
        firstElement.focus();
      } else if (event.shiftKey && currentFocused === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    };

    modalElement.addEventListener('keydown', handleKeyDown);

    return () => {
      modalElement.removeEventListener('keydown', handleKeyDown);
      lastFocusedElementRef.current?.focus?.();
    };
  }, [isOpen]);

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
        ref={modalRef}
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
