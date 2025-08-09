interface DailyTradesHeaderProps {
  selectedDate: Date;
  onAddTrade: (date: Date) => void;
}

export function DailyTradesHeader({ selectedDate, onAddTrade }: DailyTradesHeaderProps) {
  return (
    <div className="daily-trades-header">
      <h2>{selectedDate.toLocaleDateString('ja-JP')}の取引</h2>
      <button 
        className="add-daily-trade-button"
        onClick={() => onAddTrade(selectedDate)}
        title={`${selectedDate.toLocaleDateString('ja-JP')}の取引を追加`}
      >
        <span className="button-icon">+</span>
        取引を追加
      </button>
    </div>
  );
}