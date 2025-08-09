import React from 'react';
import './Section.css';

export type SectionVariant = 'default' | 'bordered' | 'elevated';
export type SectionPadding = 'none' | 'small' | 'medium' | 'large';

export interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: SectionVariant;
  padding?: SectionPadding;
  className?: string;
  headerActions?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  padding = 'medium',
  className = '',
  headerActions
}) => {
  const sectionClasses = [
    'section',
    `section--${variant}`,
    `section--padding-${padding}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <section className={sectionClasses}>
      {(title || subtitle || headerActions) && (
        <div className="section__header">
          <div className="section__header-content">
            {title && <h3 className="section__title">{title}</h3>}
            {subtitle && <p className="section__subtitle">{subtitle}</p>}
          </div>
          {headerActions && (
            <div className="section__header-actions">
              {headerActions}
            </div>
          )}
        </div>
      )}
      <div className="section__content">
        {children}
      </div>
    </section>
  );
};