import { useState } from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { ThemeMode } from '../../../types/Theme';
import '../../../styles/ThemeSettings.css';

export function ThemeSettings() {
  const { theme, themeMode, setThemeMode, updateCustomTheme, resetCustomTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'mode' | 'custom'>('mode');

  const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const handleColorChange = (category: string, key: string, value: string) => {
    updateCustomTheme({
      [category]: {
        [key]: value,
      },
    });
  };

  return (
    <div className="theme-settings">
      <div className="theme-header">
        <h2>テーマ設定</h2>
      </div>

      <div className="theme-tabs">
        <button
          className={`tab-button ${activeTab === 'mode' ? 'active' : ''}`}
          onClick={() => setActiveTab('mode')}
        >
          テーマモード
        </button>
        <button
          className={`tab-button ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          カスタマイズ
        </button>
      </div>

      {activeTab === 'mode' && (
        <div className="theme-mode-section">
          <div className="theme-options">
            <label className={`theme-option ${themeMode === 'light' ? 'active' : ''}`}>
              <input
                type="radio"
                name="theme"
                value="light"
                checked={themeMode === 'light'}
                onChange={() => handleThemeModeChange('light')}
              />
              <div className="option-content">
                <div className="option-preview light-preview">
                  <div className="preview-header"></div>
                  <div className="preview-content">
                    <div className="preview-card"></div>
                    <div className="preview-card"></div>
                  </div>
                </div>
                <span className="option-label">ライトモード</span>
              </div>
            </label>

            <label className={`theme-option ${themeMode === 'dark' ? 'active' : ''}`}>
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={themeMode === 'dark'}
                onChange={() => handleThemeModeChange('dark')}
              />
              <div className="option-content">
                <div className="option-preview dark-preview">
                  <div className="preview-header"></div>
                  <div className="preview-content">
                    <div className="preview-card"></div>
                    <div className="preview-card"></div>
                  </div>
                </div>
                <span className="option-label">ダークモード</span>
              </div>
            </label>

            <label className={`theme-option ${themeMode === 'custom' ? 'active' : ''}`}>
              <input
                type="radio"
                name="theme"
                value="custom"
                checked={themeMode === 'custom'}
                onChange={() => handleThemeModeChange('custom')}
              />
              <div className="option-content">
                <div className="option-preview custom-preview">
                  <div className="preview-header"></div>
                  <div className="preview-content">
                    <div className="preview-card"></div>
                    <div className="preview-card"></div>
                  </div>
                </div>
                <span className="option-label">カスタム</span>
              </div>
            </label>
          </div>
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="custom-theme-section">
          {themeMode !== 'custom' && (
            <div className="custom-notice">
              カスタムテーマを編集するには、先にカスタムモードを選択してください。
            </div>
          )}
          <div className={`color-settings ${themeMode !== 'custom' ? 'disabled' : ''}`}>
            <div className="color-group">
              <h3>アクセントカラー</h3>
              <div className="color-inputs">
                <div className="color-input">
                  <label>プライマリ</label>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      value={theme.colors.accent.primary}
                      onChange={(e) => handleColorChange('accent', 'primary', e.target.value)}
                      disabled={themeMode !== 'custom'}
                    />
                    <input
                      type="text"
                      value={theme.colors.accent.primary}
                      onChange={(e) => handleColorChange('accent', 'primary', e.target.value)}
                      disabled={themeMode !== 'custom'}
                    />
                  </div>
                </div>
                <div className="color-input">
                  <label>セカンダリ</label>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      value={theme.colors.accent.secondary}
                      onChange={(e) => handleColorChange('accent', 'secondary', e.target.value)}
                      disabled={themeMode !== 'custom'}
                    />
                    <input
                      type="text"
                      value={theme.colors.accent.secondary}
                      onChange={(e) => handleColorChange('accent', 'secondary', e.target.value)}
                      disabled={themeMode !== 'custom'}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="color-group">
              <h3>ステータスカラー</h3>
              <div className="color-inputs">
                <div className="color-input">
                  <label>利益</label>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      value={theme.colors.status.profit}
                      onChange={(e) => handleColorChange('status', 'profit', e.target.value)}
                      disabled={themeMode !== 'custom'}
                    />
                    <input
                      type="text"
                      value={theme.colors.status.profit}
                      onChange={(e) => handleColorChange('status', 'profit', e.target.value)}
                      disabled={themeMode !== 'custom'}
                    />
                  </div>
                </div>
                <div className="color-input">
                  <label>損失</label>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      value={theme.colors.status.loss}
                      onChange={(e) => handleColorChange('status', 'loss', e.target.value)}
                      disabled={themeMode !== 'custom'}
                    />
                    <input
                      type="text"
                      value={theme.colors.status.loss}
                      onChange={(e) => handleColorChange('status', 'loss', e.target.value)}
                      disabled={themeMode !== 'custom'}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="color-group">
              <h3>背景色</h3>
              <div className="color-inputs">
                <div className="color-input">
                  <label>プライマリ</label>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      value={theme.colors.background.primary}
                      onChange={(e) => handleColorChange('background', 'primary', e.target.value)}
                      disabled={themeMode !== 'custom'}
                    />
                    <input
                      type="text"
                      value={theme.colors.background.primary}
                      onChange={(e) => handleColorChange('background', 'primary', e.target.value)}
                      disabled={themeMode !== 'custom'}
                    />
                  </div>
                </div>
                <div className="color-input">
                  <label>セカンダリ</label>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      value={theme.colors.background.secondary}
                      onChange={(e) => handleColorChange('background', 'secondary', e.target.value)}
                      disabled={themeMode !== 'custom'}
                    />
                    <input
                      type="text"
                      value={theme.colors.background.secondary}
                      onChange={(e) => handleColorChange('background', 'secondary', e.target.value)}
                      disabled={themeMode !== 'custom'}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              className="reset-button"
              onClick={resetCustomTheme}
              disabled={themeMode !== 'custom'}
            >
              デフォルトに戻す
            </button>
          </div>
        </div>
      )}
    </div>
  );
}