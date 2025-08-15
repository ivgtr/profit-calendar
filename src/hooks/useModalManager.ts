import { useState, useCallback } from 'react';

/**
 * モーダル管理用の型定義
 */
export type ModalType = 
  | 'import'
  | 'history' 
  | 'tradeForm'
  | 'bulkDelete'
  | 'monthlyReport'
  | 'yearlyChart'
  | 'themeSettings'
  | 'userGuide'
  | 'terms'
  | 'privacy'
  | 'disclaimer'
  | 'backupRestore'
  | 'statisticsExport';

/**
 * モーダル状態管理のカスタムフック
 * 複数のモーダル状態を統一的に管理し、同時に複数のモーダルが開かれることを防ぐ
 */
export const useModalManager = () => {
  const [currentModal, setCurrentModal] = useState<ModalType | null>(null);

  /**
   * モーダルを開く
   * @param modalType 開くモーダルの種類
   */
  const openModal = useCallback((modalType: ModalType) => {
    setCurrentModal(modalType);
  }, []);

  /**
   * 現在のモーダルを閉じる
   */
  const closeModal = useCallback(() => {
    setCurrentModal(null);
  }, []);

  /**
   * 指定されたモーダルが開いているかチェック
   * @param modalType チェックするモーダルの種類
   * @returns モーダルが開いているかどうか
   */
  const isModalOpen = useCallback((modalType: ModalType) => {
    return currentModal === modalType;
  }, [currentModal]);

  /**
   * 任意のモーダルが開いているかチェック
   * @returns いずれかのモーダルが開いているかどうか
   */
  const isAnyModalOpen = useCallback(() => {
    return currentModal !== null;
  }, [currentModal]);

  /**
   * モーダル切り替え（開いている場合は閉じ、閉じている場合は開く）
   * @param modalType 切り替えるモーダルの種類
   */
  const toggleModal = useCallback((modalType: ModalType) => {
    setCurrentModal(current => current === modalType ? null : modalType);
  }, []);

  return {
    currentModal,
    openModal,
    closeModal,
    isModalOpen,
    isAnyModalOpen,
    toggleModal,
  };
};