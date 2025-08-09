import { useState } from 'react';
import { HeaderAction } from '../../../types/HeaderActions';
import './Header.css';

interface HeaderProps {
  onAction: (action: HeaderAction) => void;
}

type MenuCategory = 'main' | 'data' | 'analytics' | 'settings' | 'legal';

export function Header({ onAction }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<MenuCategory>('main');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setCurrentCategory('main');
  };

  const handleMenuItemClick = (action: HeaderAction) => {
    onAction(action);
    setIsMenuOpen(false);
    setCurrentCategory('main');
  };

  const handleCategoryClick = (category: MenuCategory) => {
    setCurrentCategory(category);
  };

  const handleBackClick = () => {
    setCurrentCategory('main');
  };

  const renderMenuContent = () => {
    switch (currentCategory) {
      case 'main':
        return (
          <>
            <button 
              className="menu-item"
              onClick={() => handleMenuItemClick({ type: 'OPEN_TRADE_FORM_MODAL' })}
            >
              <span className="menu-icon">➕</span>
              新規取引入力
            </button>
            
            <hr className="menu-divider" />
            
            <button 
              className="menu-item"
              onClick={() => handleCategoryClick('data')}
            >
              <span className="menu-icon">💾</span>
              データ管理
              <span className="menu-arrow">→</span>
            </button>
            
            <button 
              className="menu-item"
              onClick={() => handleCategoryClick('analytics')}
            >
              <span className="menu-icon">📊</span>
              分析・レポート
              <span className="menu-arrow">→</span>
            </button>
            
            <button 
              className="menu-item"
              onClick={() => handleCategoryClick('settings')}
            >
              <span className="menu-icon">⚙️</span>
              設定・ヘルプ
              <span className="menu-arrow">→</span>
            </button>
            
            <button 
              className="menu-item"
              onClick={() => handleCategoryClick('legal')}
            >
              <span className="menu-icon">📋</span>
              法的情報
              <span className="menu-arrow">→</span>
            </button>
          </>
        );
      
      case 'data':
        return (
          <>
            <button 
              className="menu-item menu-back"
              onClick={handleBackClick}
            >
              <span className="menu-icon">←</span>
              戻る
            </button>
            
            <hr className="menu-divider" />
            
            <button 
              className="menu-item"
              onClick={() => handleMenuItemClick({ type: 'OPEN_IMPORT_MODAL' })}
            >
              <span className="menu-icon">📁</span>
              CSVインポート
            </button>
            
            <button 
              className="menu-item"
              onClick={() => handleMenuItemClick({ type: 'OPEN_HISTORY_MODAL' })}
            >
              <span className="menu-icon">📋</span>
              インポート履歴
            </button>
            
            <button 
              className="menu-item"
              onClick={() => handleMenuItemClick({ type: 'OPEN_BACKUP_RESTORE_MODAL' })}
            >
              <span className="menu-icon">📦</span>
              バックアップ・復元
            </button>
            
            <hr className="menu-divider" />
            
            <button 
              className="menu-item danger"
              onClick={() => handleMenuItemClick({ type: 'OPEN_BULK_DELETE_MODAL' })}
            >
              <span className="menu-icon">🗑️</span>
              取引の一括削除
            </button>
          </>
        );
      
      case 'analytics':
        return (
          <>
            <button 
              className="menu-item menu-back"
              onClick={handleBackClick}
            >
              <span className="menu-icon">←</span>
              戻る
            </button>
            
            <hr className="menu-divider" />
            
            <button 
              className="menu-item"
              onClick={() => handleMenuItemClick({ type: 'OPEN_MONTHLY_REPORT_MODAL' })}
            >
              <span className="menu-icon">📊</span>
              月別レポート
            </button>
            
            <button 
              className="menu-item"
              onClick={() => handleMenuItemClick({ type: 'OPEN_YEARLY_CHART_MODAL' })}
            >
              <span className="menu-icon">📈</span>
              年間推移グラフ
            </button>
          </>
        );
      
      case 'settings':
        return (
          <>
            <button 
              className="menu-item menu-back"
              onClick={handleBackClick}
            >
              <span className="menu-icon">←</span>
              戻る
            </button>
            
            <hr className="menu-divider" />
            
            <button 
              className="menu-item"
              onClick={() => handleMenuItemClick({ type: 'OPEN_THEME_SETTINGS_MODAL' })}
            >
              <span className="menu-icon">🎨</span>
              テーマ設定
            </button>
            
            <button 
              className="menu-item help"
              onClick={() => handleMenuItemClick({ type: 'OPEN_USER_GUIDE_MODAL' })}
            >
              <span className="menu-icon">❓</span>
              使い方ガイド
            </button>
          </>
        );
      
      case 'legal':
        return (
          <>
            <button 
              className="menu-item menu-back"
              onClick={handleBackClick}
            >
              <span className="menu-icon">←</span>
              戻る
            </button>
            
            <hr className="menu-divider" />
            
            <button 
              className="menu-item info"
              onClick={() => handleMenuItemClick({ type: 'OPEN_TERMS_MODAL' })}
            >
              <span className="menu-icon">📄</span>
              利用規約
            </button>
            
            <button 
              className="menu-item info"
              onClick={() => handleMenuItemClick({ type: 'OPEN_PRIVACY_MODAL' })}
            >
              <span className="menu-icon">🔒</span>
              プライバシーポリシー
            </button>
            
            <button 
              className="menu-item info"
              onClick={() => handleMenuItemClick({ type: 'OPEN_DISCLAIMER_MODAL' })}
            >
              <span className="menu-icon">⚠️</span>
              免責事項
            </button>
          </>
        );
      
      default:
        return null;
    }
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
                {renderMenuContent()}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}