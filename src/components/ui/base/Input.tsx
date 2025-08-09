import React from 'react';
import './Input.css';

export type InputVariant = 'default' | 'error' | 'success';
export type InputSize = 'small' | 'medium' | 'large';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    variant = 'default',
    size = 'medium',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    id,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const baseClass = 'input-field';
    const variantClass = error ? 'input-field--error' : `input-field--${variant}`;
    const sizeClass = `input-field--${size}`;
    const fullWidthClass = fullWidth ? 'input-field--full-width' : '';
    const hasIconsClass = (leftIcon || rightIcon) ? 'input-field--with-icons' : '';
    
    const inputClasses = [
      'input-field__input',
      leftIcon ? 'input-field__input--with-left-icon' : '',
      rightIcon ? 'input-field__input--with-right-icon' : '',
    ].filter(Boolean).join(' ');

    const containerClasses = [
      baseClass,
      variantClass,
      sizeClass,
      fullWidthClass,
      hasIconsClass,
      className
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={inputId} className="input-field__label">
            {label}
          </label>
        )}
        <div className="input-field__container">
          {leftIcon && (
            <span className="input-field__icon input-field__icon--left">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            {...props}
          />
          {rightIcon && (
            <span className="input-field__icon input-field__icon--right">
              {rightIcon}
            </span>
          )}
        </div>
        {(error || helperText) && (
          <div className="input-field__helper">
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';