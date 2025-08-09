import React from 'react';
import { Modal } from './ui/feedback/Modal';
import { ThemeSettings } from './features/settings/ThemeSettings';
import { UserGuide } from './pages/UserGuide';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Disclaimer } from './pages/Disclaimer';
import { CSVImporter } from './features/data-management/CSVImporter';
import TradeForm from './features/trade/TradeForm';
import { MonthlyReport } from './features/analytics/MonthlyReport';
import { YearlyChart } from './features/analytics/YearlyChart';
import { BackupRestore } from './features/data-management/BackupRestore';
import { BulkDeleteTrades } from './features/data-management/BulkDeleteTrades';
import { ImportHistoryList } from './features/data-management/ImportHistoryList';
import { Trade, ImportResult } from '../types/Trade';
import { ModalType } from '../hooks/useModalManager';
import { Database } from '../services/database';


interface ModalManagerProps {
  isModalOpen: (modalType: ModalType) => boolean;
  closeModal: () => void;
  // Data-dependent props
  editingTrade?: Trade | null;
  currentMonth?: Date;
  refreshTrigger?: number;
  isDbReady?: boolean;
  databaseService?: Database;
  // Handlers
  onImportComplete?: (result: ImportResult) => void;
  onTradeSave?: (trade: Trade) => void;
  onTradeDelete?: (id: string) => void;
  onBulkDeleteComplete?: () => void;
}

export const ModalManager: React.FC<ModalManagerProps> = ({
  isModalOpen,
  closeModal,
  editingTrade,
  currentMonth,
  refreshTrigger,
  isDbReady,
  databaseService,
  onImportComplete,
  onTradeSave,
  onTradeDelete,
  onBulkDeleteComplete
}) => {
  return (
    <>
      {/* CSVインポートモーダル */}
      <Modal
        isOpen={isModalOpen('import')}
        onClose={closeModal}
        title="CSVインポート"
        size="large"
      >
        <CSVImporter onImportComplete={onImportComplete} />
      </Modal>

      {/* 取引フォームモーダル */}
      <Modal
        isOpen={isModalOpen('tradeForm')}
        onClose={closeModal}
        title={editingTrade ? '取引を編集' : '新しい取引を追加'}
        size="large"
        preventEscapeWhenEditing={true}
      >
        <TradeForm
          trade={editingTrade || undefined}
          onSave={onTradeSave || (() => {})}
          onDelete={onTradeDelete}
          onCancel={closeModal}
        />
      </Modal>

      {/* 月次レポートモーダル */}
      <Modal
        isOpen={isModalOpen('monthlyReport')}
        onClose={closeModal}
        title="月次レポート"
        size="xlarge"
      >
        <MonthlyReport 
          currentMonth={currentMonth || new Date()} 
          refreshTrigger={refreshTrigger || 0} 
          isDbReady={isDbReady || false}
        />
      </Modal>

      {/* 年次チャートモーダル */}
      <Modal
        isOpen={isModalOpen('yearlyChart')}
        onClose={closeModal}
        title="年間収益チャート"
        size="large"
      >
        <YearlyChart 
          databaseService={databaseService || new Database()}
          isDbReady={isDbReady || false}
        />
      </Modal>

      {/* バックアップ・復元モーダル */}
      <Modal
        isOpen={isModalOpen('backupRestore')}
        onClose={closeModal}
        title="データのバックアップ・復元"
        size="medium"
      >
        <BackupRestore />
      </Modal>

      {/* 一括削除モーダル */}
      <Modal
        isOpen={isModalOpen('bulkDelete')}
        onClose={closeModal}
        title="取引履歴の一括削除"
        size="medium"
      >
        <BulkDeleteTrades onComplete={onBulkDeleteComplete || (() => {})} />
      </Modal>

      {/* インポート履歴モーダル */}
      <Modal
        isOpen={isModalOpen('history')}
        onClose={closeModal}
        title="インポート履歴"
        size="large"
      >
        <ImportHistoryList />
      </Modal>


      {/* テーマ設定モーダル */}
      <Modal
        isOpen={isModalOpen('themeSettings')}
        onClose={closeModal}
        title=""
        size="medium"
        preventEscapeWhenEditing={true}
      >
        <ThemeSettings />
      </Modal>

      {/* 使い方ガイドモーダル */}
      <Modal
        isOpen={isModalOpen('userGuide')}
        onClose={closeModal}
        title=""
        size="large"
      >
        <UserGuide />
      </Modal>

      {/* 利用規約モーダル */}
      <Modal
        isOpen={isModalOpen('terms')}
        onClose={closeModal}
        title=""
        size="large"
      >
        <TermsOfService />
      </Modal>

      {/* プライバシーポリシーモーダル */}
      <Modal
        isOpen={isModalOpen('privacy')}
        onClose={closeModal}
        title=""
        size="large"
      >
        <PrivacyPolicy />
      </Modal>

      {/* 免責事項モーダル */}
      <Modal
        isOpen={isModalOpen('disclaimer')}
        onClose={closeModal}
        title=""
        size="large"
      >
        <Disclaimer />
      </Modal>

    </>
  );
};