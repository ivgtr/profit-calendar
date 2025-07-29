import { useState } from 'react';
import '../styles/Header.css';

interface HeaderProps {
  onOpenImportModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenTradeFormModal: () => void;
  onOpenBulkDeleteModal: () => void;
  onOpenMonthlyReportModal: () => void;
  onOpenYearlyChartModal: () => void;
  onOpenUserGuideModal: () => void;
  onOpenThemeSettingsModal: () => void;
  onOpenTermsModal: () => void;
  onOpenPrivacyModal: () => void;
  onOpenDisclaimerModal: () => void;
}

export function Header({ onOpenImportModal, onOpenHistoryModal, onOpenTradeFormModal, onOpenBulkDeleteModal, onOpenMonthlyReportModal, onOpenYearlyChartModal, onOpenUserGuideModal, onOpenThemeSettingsModal, onOpenTermsModal, onOpenPrivacyModal, onOpenDisclaimerModal }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <h1>利益カレンダー</h1>
        
        <div className="header-menu">
          <button 
            className="menu-toggle"
            onClick={toggleMenu}
            aria-label="メニューを開く"
          >
            ☰
          </button>
          
          {isMenuOpen && (
            <div className="menu-dropdown">
              <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)} />
              <div className="menu-items">
                <button 
                  className="menu-item"
                  onClick={() => handleMenuItemClick(onOpenTradeFormModal)}
                >
                  <span className="menu-icon">➕</span>
                  新規取引入力
                </button>
                
                <button 
                  className="menu-item"
                  onClick={() => handleMenuItemClick(onOpenImportModal)}
                >
                  <span className="menu-icon">📁</span>
                  CSVインポート
                </button>
                
                <button 
                  className="menu-item"
                  onClick={() => handleMenuItemClick(onOpenHistoryModal)}
                >
                  <span className="menu-icon">📋</span>
                  インポート履歴
                </button>
                
                <button 
                  className="menu-item"
                  onClick={() => handleMenuItemClick(onOpenMonthlyReportModal)}
                >
                  <span className="menu-icon">📊</span>
                  月別レポート
                </button>
                
                <button 
                  className="menu-item"
                  onClick={() => handleMenuItemClick(onOpenYearlyChartModal)}
                >
                  <span className="menu-icon">📈</span>
                  年間推移グラフ
                </button>
                
                <hr className="menu-divider" />
                
                <button 
                  className="menu-item danger"
                  onClick={() => handleMenuItemClick(onOpenBulkDeleteModal)}
                >
                  <span className="menu-icon">🗑️</span>
                  取引の一括削除
                </button>
                
                <hr className="menu-divider" />
                
                <button 
                  className="menu-item help"
                  onClick={() => handleMenuItemClick(onOpenUserGuideModal)}
                >
                  <span className="menu-icon">❓</span>
                  使い方ガイド
                </button>
                
                <button 
                  className="menu-item"
                  onClick={() => handleMenuItemClick(onOpenThemeSettingsModal)}
                >
                  <span className="menu-icon">🎨</span>
                  テーマ設定
                </button>
                
                <hr className="menu-divider" />
                
                <button 
                  className="menu-item info"
                  onClick={() => handleMenuItemClick(onOpenTermsModal)}
                >
                  <span className="menu-icon">📄</span>
                  利用規約
                </button>
                
                <button 
                  className="menu-item info"
                  onClick={() => handleMenuItemClick(onOpenPrivacyModal)}
                >
                  <span className="menu-icon">🔒</span>
                  プライバシーポリシー
                </button>
                
                <button 
                  className="menu-item info"
                  onClick={() => handleMenuItemClick(onOpenDisclaimerModal)}
                >
                  <span className="menu-icon">⚠️</span>
                  免責事項
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}