import React from 'react';
import { Icon, type IconName } from '../base/Icon';
import './Summary.css';

export type SummaryVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export type SummarySize = 'small' | 'medium' | 'large';

export interface SummaryItem {
  label: string;
  value: string | number;
  icon?: IconName;
  variant?: SummaryVariant;
  description?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    label?: string;
  };
}

export interface SummaryProps {
  items: SummaryItem[];
  variant?: SummaryVariant;
  size?: SummarySize;
  layout?: 'horizontal' | 'vertical' | 'grid';
  className?: string;
  bordered?: boolean;
  hoverable?: boolean;
}

export const Summary: React.FC<SummaryProps> = ({
  items,
  variant = 'default',
  size = 'medium',
  layout = 'horizontal',
  className = '',
  bordered = false,
  hoverable = false
}) => {
  const summaryClasses = [
    'summary',
    `summary--${variant}`,
    `summary--${size}`,
    `summary--${layout}`,
    bordered && 'summary--bordered',
    hoverable && 'summary--hoverable',
    className
  ].filter(Boolean).join(' ');

  const getVariantClass = (itemVariant?: SummaryVariant) => {
    return `summary__item--${itemVariant || variant}`;
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral'): IconName => {
    switch (direction) {
      case 'up':
        return 'arrow-up';
      case 'down':
        return 'arrow-down';
      case 'neutral':
      default:
        return 'arrow-right';
    }
  };

  const getTrendClass = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return 'summary__trend--positive';
      case 'down':
        return 'summary__trend--negative';
      case 'neutral':
      default:
        return 'summary__trend--neutral';
    }
  };

  return (
    <div className={summaryClasses}>
      {items.map((item, index) => (
        <div 
          key={`${item.label}-${index}`}
          className={`summary__item ${getVariantClass(item.variant)}`}
        >
          {item.icon && (
            <div className="summary__item-icon">
              <Icon name={item.icon} size={size === 'small' ? 'medium' : 'large'} />
            </div>
          )}
          <div className="summary__item-content">
            <div className="summary__item-header">
              <span className="summary__item-label">{item.label}</span>
              {item.trend && (
                <div className={`summary__trend ${getTrendClass(item.trend.direction)}`}>
                  <Icon 
                    name={getTrendIcon(item.trend.direction)} 
                    size="small" 
                  />
                  <span className="summary__trend-value">{item.trend.value}</span>
                  {item.trend.label && (
                    <span className="summary__trend-label">({item.trend.label})</span>
                  )}
                </div>
              )}
            </div>
            <div className="summary__item-value">{item.value}</div>
            {item.description && (
              <div className="summary__item-description">{item.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};