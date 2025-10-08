import { useState } from 'react';
import { HeaderAction } from '../../../types/HeaderActions';
import { Button, ButtonProps } from '../../ui/base/Button';
import { Icon } from '../base/Icon';
import './Header.css';

interface HeaderProps {
  onAction: (action: HeaderAction) => void;
}

type MenuCategory = 'main' | 'data' | 'analytics' | 'settings' | 'legal';

const MenuButton = ({ className = '', variant = 'ghost', size = 'medium', children, icon, ...props }: ButtonProps) => (
  <Button
    type="button"
    variant={variant}
    size={size}
    className={`menu-item ${className}`.trim()}
    iconPosition="left"
    icon={icon}
    {...props}
  >
    {children}
  </Button>
);

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
            <MenuButton
              onClick={() => handleMenuItemClick({ type: 'OPEN_TRADE_FORM_MODAL' })}
              icon={<Icon name="add" size="medium" className="menu-icon" />}
            >
              新規取引入力
            </MenuButton>
            
            <hr className="menu-divider" />
            
            <MenuButton
              onClick={() => handleCategoryClick('data')}
              icon={<Icon name="download" size="medium" className="menu-icon" />}
            >
              <span className="menu-label">データ管理</span>
              <span className="menu-arrow">→</span>
            </MenuButton>
            
            <MenuButton
              onClick={() => handleCategoryClick('analytics')}
              icon={<Icon name="chart" size="medium" className="menu-icon" />}
            >
              <span className="menu-label">分析・レポート</span>
              <span className="menu-arrow">→</span>
            </MenuButton>
            
            <MenuButton
              onClick={() => handleCategoryClick('settings')}
              icon={<Icon name="settings" size="medium" className="menu-icon" />}
            >
              <span className="menu-label">設定・ヘルプ</span>
              <span className="menu-arrow">→</span>
            </MenuButton>
            
            <MenuButton
              onClick={() => handleCategoryClick('legal')}
              icon={<Icon name="info" size="medium" className="menu-icon" />}
            >
              <span className="menu-label">法的情報</span>
              <span className="menu-arrow">→</span>
            </MenuButton>
          </>
        );
      
      case 'data':
        return (
          <>
            <MenuButton
              className="menu-back"
              onClick={handleBackClick}
              icon={<Icon name="chevron-left" size="medium" className="menu-icon" />}
            >
              戻る
            </MenuButton>
            
            <hr className="menu-divider" />
            
            <MenuButton
              onClick={() => handleMenuItemClick({ type: 'OPEN_IMPORT_MODAL' })}
              icon={<Icon name="upload" size="medium" className="menu-icon" />}
            >
              CSVインポート
            </MenuButton>
            
            <MenuButton
              onClick={() => handleMenuItemClick({ type: 'OPEN_HISTORY_MODAL' })}
              icon={<Icon name="info" size="medium" className="menu-icon" />}
            >
              インポート履歴
            </MenuButton>
            
            <MenuButton
              onClick={() => handleMenuItemClick({ type: 'OPEN_BACKUP_RESTORE_MODAL' })}
              icon={<Icon name="download" size="medium" className="menu-icon" />}
            >
              バックアップ・復元
            </MenuButton>
            
            <hr className="menu-divider" />
            
            <MenuButton
              className="danger"
              onClick={() => handleMenuItemClick({ type: 'OPEN_BULK_DELETE_MODAL' })}
              icon={<Icon name="delete" size="medium" className="menu-icon" />}
            >
              取引の一括削除
            </MenuButton>
          </>
        );
      
      case 'analytics':
        return (
          <>
            <MenuButton
              className="menu-back"
              onClick={handleBackClick}
              icon={<Icon name="chevron-left" size="medium" className="menu-icon" />}
            >
              戻る
            </MenuButton>
            
            <hr className="menu-divider" />
            
            <MenuButton
              onClick={() => handleMenuItemClick({ type: 'OPEN_MONTHLY_REPORT_MODAL' })}
              icon={<Icon name="chart" size="medium" className="menu-icon" />}
            >
              月別レポート
            </MenuButton>
            
            <MenuButton
              onClick={() => handleMenuItemClick({ type: 'OPEN_YEARLY_CHART_MODAL' })}
              icon={<Icon name="chart" size="medium" className="menu-icon" />}
            >
              収益チャート
            </MenuButton>
            
            <MenuButton
              onClick={() => handleMenuItemClick({ type: 'OPEN_STATISTICS_EXPORT_MODAL' })}
              icon={<Icon name="download" size="medium" className="menu-icon" />}
            >
              AI分析用データ出力
            </MenuButton>
          </>
        );
      
      case 'settings':
        return (
          <>
            <MenuButton
              className="menu-back"
              onClick={handleBackClick}
              icon={<Icon name="chevron-left" size="medium" className="menu-icon" />}
            >
              戻る
            </MenuButton>
            
            <hr className="menu-divider" />
            
            <MenuButton
              onClick={() => handleMenuItemClick({ type: 'OPEN_THEME_SETTINGS_MODAL' })}
              icon={<Icon name="settings" size="medium" className="menu-icon" />}
            >
              テーマ設定
            </MenuButton>
            
            <MenuButton
              className="help"
              onClick={() => handleMenuItemClick({ type: 'OPEN_USER_GUIDE_MODAL' })}
              icon={<Icon name="info" size="medium" className="menu-icon" />}
            >
              使い方ガイド
            </MenuButton>
          </>
        );
      
      case 'legal':
        return (
          <>
            <MenuButton
              className="menu-back"
              onClick={handleBackClick}
              icon={<Icon name="chevron-left" size="medium" className="menu-icon" />}
            >
              戻る
            </MenuButton>
            
            <hr className="menu-divider" />
            
            <MenuButton
              className="info"
              onClick={() => handleMenuItemClick({ type: 'OPEN_TERMS_MODAL' })}
              icon={<Icon name="info" size="medium" className="menu-icon" />}
            >
              利用規約
            </MenuButton>

            <MenuButton
              className="info"
              onClick={() => handleMenuItemClick({ type: 'OPEN_PRIVACY_MODAL' })}
              icon={<Icon name="lock" size="medium" className="menu-icon" />}
            >
              プライバシーポリシー
            </MenuButton>

            <MenuButton
              className="info"
              onClick={() => handleMenuItemClick({ type: 'OPEN_DISCLAIMER_MODAL' })}
              icon={<Icon name="warning" size="medium" className="menu-icon" />}
            >
              免責事項
            </MenuButton>
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
          <Button
            className="menu-toggle"
            onClick={toggleMenu}
            aria-label="メニューを開く"
            variant="ghost"
            size="small"
            icon={<Icon name="menu" size="medium" />}
            iconOnly
          />
          
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
