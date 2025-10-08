import React from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  iconOnly?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'medium', 
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    iconOnly = false,
    children, 
    className = '', 
    disabled,
    ...props 
  }, ref) => {
    const baseClass = 'btn';
    const variantClass = `btn--${variant}`;
    const sizeClass = `btn--${size}`;
    const loadingClass = loading ? 'btn--loading' : '';
    const fullWidthClass = fullWidth ? 'btn--full' : '';
    const iconOnlyClass = iconOnly ? 'btn--icon-only' : '';

    const classes = [baseClass, variantClass, sizeClass, loadingClass, fullWidthClass, iconOnlyClass, className]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="btn__spinner" />}
        {icon && !loading && iconPosition === 'left' && (
          <span className="btn__icon btn__icon--left">{icon}</span>
        )}
        {children && (
          <span className="btn__text">{children}</span>
        )}
        {icon && !loading && iconPosition === 'right' && (
          <span className="btn__icon btn__icon--right">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
