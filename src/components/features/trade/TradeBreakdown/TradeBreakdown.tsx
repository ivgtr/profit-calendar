import { BreakdownItem, BreakdownItemData } from './BreakdownItem';

interface TradeBreakdownProps {
  breakdownItems: BreakdownItemData[];
  onTradeTypeClick: (type: 'spot' | 'margin' | 'unknown', label: string) => void;
  isDesktop?: boolean;
  showMobileBreakdown?: boolean;
}

export function TradeBreakdown({ 
  breakdownItems, 
  onTradeTypeClick, 
  isDesktop = true, 
  showMobileBreakdown = false 
}: TradeBreakdownProps) {
  if (breakdownItems.length === 0) {
    return null;
  }

  const handleItemClick = (e: React.MouseEvent) => {
    if (isDesktop) {
      e.stopPropagation();
    }
  };

  if (isDesktop) {
    // デスクトップ版breakdown
    return (
      <div className="trade-breakdown desktop-breakdown">
        <div className="breakdown-list">
          {breakdownItems.map(item => (
            <BreakdownItem
              key={item.label}
              item={item}
              isMobile={false}
              onClick={onTradeTypeClick}
              onItemClick={handleItemClick}
            />
          ))}
        </div>
      </div>
    );
  }

  if (showMobileBreakdown) {
    // モバイル版breakdown（展開時のみ）
    return (
      <div className="trade-breakdown mobile-breakdown">
        <div className="breakdown-list">
          {breakdownItems.map(item => (
            <BreakdownItem
              key={item.mobileLabel}
              item={item}
              isMobile={true}
              onClick={onTradeTypeClick}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}