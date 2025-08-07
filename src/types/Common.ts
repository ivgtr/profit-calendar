// 共通のコンポーネントProps基底型
export interface BaseProps {
  className?: string;
  id?: string;
}

// ローディング状態を持つコンポーネント用
export interface LoadingProps {
  isLoading?: boolean;
}

// モーダル系コンポーネント共通Props
export interface ModalBaseProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: ComponentSize;
}

// ファイルサイズ定義
export type ComponentSize = 'small' | 'medium' | 'large';

// 共通のイベントハンドラー型
export type EventHandler<T = void> = () => T;
export type EventHandlerWithParam<P, T = void> = (param: P) => T;

// 日付関連の共通型
export type DateHandler = EventHandlerWithParam<Date>;
export type DateRangeHandler = EventHandlerWithParam<{ start: Date; end: Date }>;

// データ操作の共通型
export type DataUpdateHandler<T> = EventHandlerWithParam<T>;
export type DataDeleteHandler = EventHandlerWithParam<string>;