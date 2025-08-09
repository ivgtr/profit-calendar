import React from 'react';
import './Chart.css';

export interface ChartProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  className?: string;
  height?: number | string;
  width?: number | string;
  actions?: React.ReactNode;
}

export const Chart: React.FC<ChartProps> = ({
  children,
  title,
  subtitle,
  loading = false,
  error,
  className = '',
  height = 400,
  width = '100%',
  actions
}) => {
  const chartClasses = [
    'chart',
    className
  ].filter(Boolean).join(' ');

  const chartStyle: React.CSSProperties = {
    height: typeof height === 'number' ? `${height}px` : height,
    width: typeof width === 'number' ? `${width}px` : width,
  };

  if (error) {
    return (
      <div className={chartClasses}>
        {(title || subtitle || actions) && (
          <div className="chart__header">
            <div className="chart__header-content">
              {title && <h3 className="chart__title">{title}</h3>}
              {subtitle && <p className="chart__subtitle">{subtitle}</p>}
            </div>
            {actions && (
              <div className="chart__actions">
                {actions}
              </div>
            )}
          </div>
        )}
        <div className="chart__error" style={chartStyle}>
          <div className="chart__error-content">
            <span className="chart__error-icon">⚠️</span>
            <span className="chart__error-message">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={chartClasses}>
        {(title || subtitle || actions) && (
          <div className="chart__header">
            <div className="chart__header-content">
              {title && <h3 className="chart__title">{title}</h3>}
              {subtitle && <p className="chart__subtitle">{subtitle}</p>}
            </div>
            {actions && (
              <div className="chart__actions">
                {actions}
              </div>
            )}
          </div>
        )}
        <div className="chart__loading" style={chartStyle}>
          <div className="chart__loading-spinner" />
          <span>チャートを読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={chartClasses}>
      {(title || subtitle || actions) && (
        <div className="chart__header">
          <div className="chart__header-content">
            {title && <h3 className="chart__title">{title}</h3>}
            {subtitle && <p className="chart__subtitle">{subtitle}</p>}
          </div>
          {actions && (
            <div className="chart__actions">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="chart__content" style={chartStyle}>
        {children}
      </div>
    </div>
  );
};