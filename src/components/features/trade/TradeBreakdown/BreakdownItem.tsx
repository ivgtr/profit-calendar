import { formatCurrency } from '../../../../utils/formatUtils';

export interface BreakdownItemData {
  label: string;
  mobileLabel: string;
  profit: number;
  type: 'spot' | 'margin' | 'unknown';
}

interface BreakdownItemProps {
  item: BreakdownItemData;
  isMobile?: boolean;
  onClick: (type: 'spot' | 'margin' | 'unknown', label: string) => void;
  onItemClick?: (e: React.MouseEvent) => void;
}

export function BreakdownItem({ item, isMobile = false, onClick, onItemClick }: BreakdownItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onItemClick) {
      onItemClick(e);
    }
    onClick(item.type, item.label);
  };

  return (
    <div 
      className="breakdown-item clickable"
      onClick={handleClick}
      title={`${item.label}取引の詳細を表示`}
    >
      <div className="breakdown-label">
        {isMobile ? item.mobileLabel : item.label}
      </div>
      <div className={`breakdown-profit ${item.profit >= 0 ? 'profit' : 'loss'}`}>
        {item.profit >= 0 ? '+' : ''}
        {formatCurrency(item.profit)}円
      </div>
    </div>
  );
}