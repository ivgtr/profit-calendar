import { useMemo } from 'react';
import { BreakdownItemData } from '../components/ui/BreakdownItem';

interface ProfitData {
  spotProfit: number;
  marginProfit: number;
  unknownProfit: number;
}

/**
 * 共通のprofit breakdown ロジック
 * 月次・日次両方で使用可能
 */
export function useProfitBreakdown(profitData: ProfitData): {
  breakdownItems: BreakdownItemData[];
  hasBreakdown: boolean;
} {
  const breakdownItems = useMemo(() => {
    const items: BreakdownItemData[] = [
      { 
        label: '現物', 
        mobileLabel: '現物取引', 
        profit: profitData.spotProfit,
        type: 'spot' as const
      },
      { 
        label: '信用', 
        mobileLabel: '信用取引', 
        profit: profitData.marginProfit,
        type: 'margin' as const
      },
      { 
        label: '不明', 
        mobileLabel: '不明取引', 
        profit: profitData.unknownProfit,
        type: 'unknown' as const
      }
    ];
    
    // 利益が0でない項目のみフィルタリング
    return items.filter(item => item.profit !== 0);
  }, [profitData.spotProfit, profitData.marginProfit, profitData.unknownProfit]);

  const hasBreakdown = breakdownItems.length > 0;

  return {
    breakdownItems,
    hasBreakdown
  };
}