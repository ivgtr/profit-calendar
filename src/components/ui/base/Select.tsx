import React from 'react';
import './Select.css';

export type SelectVariant = 'default' | 'error' | 'success';
export type SelectSize = 'small' | 'medium' | 'large';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  variant?: SelectVariant;
  size?: SelectSize;
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({
    variant = 'default',
    size = 'medium',
    label,
    error,
    helperText,
    options,
    placeholder,
    fullWidth = false,
    className = '',
    id,
    ...props
  }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const baseClass = 'select-field';
    const variantClass = error ? 'select-field--error' : `select-field--${variant}`;
    const sizeClass = `select-field--${size}`;
    const fullWidthClass = fullWidth ? 'select-field--full-width' : '';

    const containerClasses = [
      baseClass,
      variantClass,
      sizeClass,
      fullWidthClass,
      className
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={selectId} className="select-field__label">
            {label}
          </label>
        )}
        <div className="select-field__container">
          <select
            ref={ref}
            id={selectId}
            className="select-field__select"
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="select-field__icon">
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L6 6L11 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        {(error || helperText) && (
          <div className="select-field__helper">
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';