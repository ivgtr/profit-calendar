import { useState, useEffect, useCallback, useMemo } from 'react';
import { Trade, TradeType, AccountType } from '../types/Trade';
import { v4 as uuidv4 } from 'uuid';

export interface TradeFormData {
  date: string;
  accountType: string;
  stockName: string;
  stockCode: string;
  tradeType: string;
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

// 型定数の定義（const assertionで型安全性を確保）
const ACCOUNT_TYPES = ['特定', '一般', 'NISA'] as const;
const TRADE_TYPES = ['返済売', '返済買', '現物売', '現物買', '売却', '購入', '買付'] as const;

// 型ガード関数（asを完全に除去）
function isAccountType(value: string): value is AccountType {
  return ACCOUNT_TYPES.some(type => type === value);
}

function isTradeType(value: string): value is TradeType {
  return TRADE_TYPES.some(type => type === value);
}

// 型変換ユーティリティ関数
function convertTradeToFormData(trade: Trade): TradeFormData {
  // ローカルタイムゾーンで日付を取得
  const localDate = new Date(trade.date.getTime() - trade.date.getTimezoneOffset() * 60000);
  
  return {
    date: localDate.toISOString().split('T')[0],
    accountType: trade.accountType || '',
    stockName: trade.stockName || '',
    stockCode: trade.stockCode || '',
    tradeType: trade.tradeType || '',
    quantity: (trade.quantity != null && trade.quantity !== 0) ? trade.quantity.toString() : '',
    unitPrice: (trade.unitPrice != null && trade.unitPrice !== 0) ? trade.unitPrice.toString() : '',
    amount: (trade.amount != null && trade.amount !== 0) ? trade.amount.toString() : '',
    averageAcquisitionPrice: (trade.averageAcquisitionPrice != null && trade.averageAcquisitionPrice !== 0) ? trade.averageAcquisitionPrice.toString() : '',
    realizedProfitLoss: (trade.realizedProfitLoss != null && trade.realizedProfitLoss !== 0) ? trade.realizedProfitLoss.toString() : '',
    memo: trade.memo || '',
  };
}

function convertFormDataToTrade(formData: TradeFormData, existingTrade?: Trade): Trade {
  const now = new Date();
  // ローカルタイムゾーンで日付を作成（YYYY-MM-DD形式の文字列から）
  const [year, month, day] = formData.date.split('-').map(Number);
  
  // 型安全な変換（型ガード関数を使用）
  const accountType = formData.accountType && isAccountType(formData.accountType) 
    ? formData.accountType 
    : null;
  
  const tradeType = formData.tradeType && isTradeType(formData.tradeType) 
    ? formData.tradeType 
    : null;
  
  return {
    id: existingTrade?.id || uuidv4(),
    date: new Date(year, month - 1, day),
    accountType,
    stockName: formData.stockName?.trim() || null,
    stockCode: formData.stockCode?.trim() || undefined,
    tradeType,
    quantity: formData.quantity ? Number(formData.quantity) : null,
    unitPrice: formData.unitPrice ? Number(formData.unitPrice) : null,
    amount: formData.amount ? Number(formData.amount) : null,
    averageAcquisitionPrice: formData.averageAcquisitionPrice ? Number(formData.averageAcquisitionPrice) : null,
    realizedProfitLoss: Number(formData.realizedProfitLoss),
    memo: formData.memo?.trim() || undefined,
    csvImported: existingTrade?.csvImported || false,
    createdAt: existingTrade?.createdAt || now,
    updatedAt: now,
  };
}

export function useTradeForm({ trade, onSave }: UseTradeFormProps) {
  const [formData, setFormData] = useState<TradeFormData>({
    date: '',
    accountType: '',
    stockName: '',
    stockCode: '',
    tradeType: '',
    quantity: '',
    unitPrice: '',
    amount: '',
    averageAcquisitionPrice: '',
    realizedProfitLoss: '',
    memo: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  // 編集時の初期データ設定
  useEffect(() => {
    if (trade) {
      setFormData(convertTradeToFormData(trade));
    }
  }, [trade]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // 必須項目：約定日、実現損益
    if (!formData.date) newErrors.date = '約定日は必須です';
    if (!formData.realizedProfitLoss || formData.realizedProfitLoss.trim() === '') {
      newErrors.realizedProfitLoss = '実現損益は必須です';
    } else if (isNaN(Number(formData.realizedProfitLoss))) {
      newErrors.realizedProfitLoss = '数値を入力してください';
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

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // HTMLネイティブバリデーションを使用するため、フォームの有効性をチェック
    const form = e.target as HTMLFormElement;
    if (!form.checkValidity()) {
      form.reportValidity(); // ブラウザのデフォルトエラー表示とスクロール
      return;
    }

    const tradeData = convertFormDataToTrade(formData, trade);
    onSave(tradeData);
  }, [formData, trade, onSave]);

  // リアルタイムバリデーション（ボタンの無効化判定用）
  const isFormValid = useMemo(() => Boolean(
    formData.date && 
    formData.realizedProfitLoss && 
    formData.realizedProfitLoss.trim() !== '' &&
    !isNaN(Number(formData.realizedProfitLoss))
  ), [formData.date, formData.realizedProfitLoss]);

  return {
    formData,
    errors,
    handleInputChange,
    handleSubmit,
    validateForm,
    isFormValid,
  };
}