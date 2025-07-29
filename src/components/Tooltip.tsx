import { useState, ReactNode, useRef, useEffect } from 'react';
import '../styles/Tooltip.css';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'bottom' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && containerRef.current && tooltipRef.current) {
      const container = containerRef.current;
      const tooltip = tooltipRef.current;
      const containerRect = container.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let newPosition = position;

      // 画面外に出る場合の調整
      if (position === 'top' && containerRect.top - tooltipRect.height < 10) {
        newPosition = 'bottom';
      } else if (position === 'bottom' && containerRect.bottom + tooltipRect.height > viewport.height - 10) {
        newPosition = 'top';
      } else if (position === 'left' && containerRect.left - tooltipRect.width < 10) {
        newPosition = 'right';
      } else if (position === 'right' && containerRect.right + tooltipRect.width > viewport.width - 10) {
        newPosition = 'left';
      }

      setActualPosition(newPosition);
    }
  }, [isVisible, position]);

  return (
    <div 
      ref={containerRef}
      className="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsVisible(!isVisible);
      }}
    >
      {children}
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`tooltip tooltip-${actualPosition}`}
        >
          <div className="tooltip-content">
            {content}
          </div>
          <div className="tooltip-arrow" />
        </div>
      )}
    </div>
  );
}