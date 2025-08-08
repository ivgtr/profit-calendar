import { useState, useEffect } from 'react';
import { Trade, TradeType, AccountType } from '../types/Trade';
import { v4 as uuidv4 } from 'uuid';

export interface TradeFormData {
  date: string;
  accountType: AccountType;
  stockName: string;
  stockCode: string;
  tradeType: TradeType;
  quantity: string;
  unitPrice: string;
  amount: string;
  averageAcquisitionPrice: string;
  realizedProfitLoss: string;
  memo: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface UseTradeFormProps {
  trade?: Trade;
  onSave: (trade: Trade) => void;
}

export function useTradeForm({ trade, onSave }: UseTradeFormProps) {
  const [formData, setFormData] = useState<TradeFormData>({
    date: '',
    accountType: 'NISA' as AccountType,
    stockName: '手動入力',
    stockCode: '',
    tradeType: '現物買' as TradeType,
    quantity: '1',
    unitPrice: '1',
    amount: '1',
    averageAcquisitionPrice: '1',
    realizedProfitLoss: '',
    memo: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  // 編集時の初期データ設定
  useEffect(() => {
    if (trade) {
      // ローカルタイムゾーンで日付を取得
      const localDate = new Date(trade.date.getTime() - trade.date.getTimezoneOffset() * 60000);
      setFormData({
        date: localDate.toISOString().split('T')[0],
        accountType: trade.accountType,
        stockName: trade.stockName,
        stockCode: trade.stockCode || '',
        tradeType: trade.tradeType,
        quantity: trade.quantity.toString(),
        unitPrice: trade.unitPrice.toString(),
        amount: trade.amount.toString(),
        averageAcquisitionPrice: trade.averageAcquisitionPrice.toString(),
        realizedProfitLoss: trade.realizedProfitLoss.toString(),
        memo: trade.memo || '',
      });
    }
  }, [trade]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // 必須項目：約定日、実現損益のみ
    if (!formData.date) newErrors.date = '約定日は必須です';
    if (!formData.realizedProfitLoss || isNaN(Number(formData.realizedProfitLoss))) {
      newErrors.realizedProfitLoss = '実現損益は必須です';
    }

    // 任意項目のバリデーション（入力がある場合のみ）
    if (formData.quantity && (isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0)) {
      newErrors.quantity = '0以上の数値を入力してください';
    }
    if (formData.unitPrice && (isNaN(Number(formData.unitPrice)) || Number(formData.unitPrice) < 0)) {
      newErrors.unitPrice = '0以上の数値を入力してください';
    }
    if (formData.amount && isNaN(Number(formData.amount))) {
      newErrors.amount = '数値を入力してください';
    }
    if (formData.averageAcquisitionPrice && isNaN(Number(formData.averageAcquisitionPrice))) {
      newErrors.averageAcquisitionPrice = '数値を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const now = new Date();
    // ローカルタイムゾーンで日付を作成（YYYY-MM-DD形式の文字列から）
    const [year, month, day] = formData.date.split('-').map(Number);
    const tradeData: Trade = {
      id: trade?.id || uuidv4(),
      date: new Date(year, month - 1, day),
      accountType: formData.accountType,
      stockName: formData.stockName.trim(),
      stockCode: formData.stockCode.trim() || undefined,
      tradeType: formData.tradeType,
      quantity: Number(formData.quantity),
      unitPrice: Number(formData.unitPrice),
      amount: Number(formData.amount),
      averageAcquisitionPrice: Number(formData.averageAcquisitionPrice),
      realizedProfitLoss: Number(formData.realizedProfitLoss),
      memo: formData.memo.trim() || undefined,
      csvImported: trade?.csvImported || false,
      createdAt: trade?.createdAt || now,
      updatedAt: now,
    };

    onSave(tradeData);
  };

  return {
    formData,
    errors,
    handleInputChange,
    handleSubmit,
    validateForm,
  };
}