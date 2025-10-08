import { Button } from '../../../ui/base/Button';

interface DailyTradesHeaderProps {
  selectedDate: Date;
  onAddTrade: (date: Date) => void;
}

export function DailyTradesHeader({ selectedDate, onAddTrade }: DailyTradesHeaderProps) {
  return (
    <div className="daily-trades-header">
      <h2>{selectedDate.toLocaleDateString('ja-JP')}の取引</h2>
      <Button
        className="add-daily-trade-button"
        onClick={() => onAddTrade(selectedDate)}
        title={`${selectedDate.toLocaleDateString('ja-JP')}の取引を追加`}
        variant="primary"
        size="medium"
        icon="＋"
      >
        取引を追加
      </Button>
    </div>
  );
}
