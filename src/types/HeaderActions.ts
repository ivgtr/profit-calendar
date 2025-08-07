// Header.tsxで使用されるアクションの型定義

export type HeaderActionType =
  | 'OPEN_IMPORT_MODAL'
  | 'OPEN_HISTORY_MODAL' 
  | 'OPEN_TRADE_FORM_MODAL'
  | 'OPEN_BULK_DELETE_MODAL'
  | 'OPEN_MONTHLY_REPORT_MODAL'
  | 'OPEN_YEARLY_CHART_MODAL'
  | 'OPEN_USER_GUIDE_MODAL'
  | 'OPEN_THEME_SETTINGS_MODAL'
  | 'OPEN_BACKUP_RESTORE_MODAL'
  | 'OPEN_TERMS_MODAL'
  | 'OPEN_PRIVACY_MODAL'
  | 'OPEN_DISCLAIMER_MODAL';

export interface HeaderAction {
  type: HeaderActionType;
  payload?: unknown;
}

// アクション作成ヘルパー関数
export const headerActions = {
  openImportModal: (): HeaderAction => ({ type: 'OPEN_IMPORT_MODAL' }),
  openHistoryModal: (): HeaderAction => ({ type: 'OPEN_HISTORY_MODAL' }),
  openTradeFormModal: (): HeaderAction => ({ type: 'OPEN_TRADE_FORM_MODAL' }),
  openBulkDeleteModal: (): HeaderAction => ({ type: 'OPEN_BULK_DELETE_MODAL' }),
  openMonthlyReportModal: (): HeaderAction => ({ type: 'OPEN_MONTHLY_REPORT_MODAL' }),
  openYearlyChartModal: (): HeaderAction => ({ type: 'OPEN_YEARLY_CHART_MODAL' }),
  openUserGuideModal: (): HeaderAction => ({ type: 'OPEN_USER_GUIDE_MODAL' }),
  openThemeSettingsModal: (): HeaderAction => ({ type: 'OPEN_THEME_SETTINGS_MODAL' }),
  openBackupRestoreModal: (): HeaderAction => ({ type: 'OPEN_BACKUP_RESTORE_MODAL' }),
  openTermsModal: (): HeaderAction => ({ type: 'OPEN_TERMS_MODAL' }),
  openPrivacyModal: (): HeaderAction => ({ type: 'OPEN_PRIVACY_MODAL' }),
  openDisclaimerModal: (): HeaderAction => ({ type: 'OPEN_DISCLAIMER_MODAL' }),
} as const;