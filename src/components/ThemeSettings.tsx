import { useThemeSettings } from '../hooks/useThemeSettings';
import '../styles/ThemeSettings.css';

export function ThemeSettings() {
  const {
    theme,
    themeMode,
    activeTab,
    setActiveTab,
    handleThemeModeChange,
    handleColorChange,
    handleResetCustomTheme,
  } = useThemeSettings();

  return (
    <div className="theme-settings">
      <h3>🎨 テーマ設定</h3>
      
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
          カスタムテーマ
        </button>
      </div>

      {activeTab === 'mode' && (
        <div className="theme-mode-section">
          <div className="theme-options">
            <label className="theme-option">
              <input
                type="radio"
                name="theme-mode"
                value="light"
                checked={themeMode === 'light'}
                onChange={() => handleThemeModeChange('light')}
              />
              <div className="option-content">
                <span className="option-icon">☀️</span>
                <div className="option-text">
                  <span className="option-title">ライトモード</span>
                  <span className="option-description">明るい背景のテーマ</span>
                </div>
              </div>
            </label>

            <label className="theme-option">
              <input
                type="radio"
                name="theme-mode"
                value="dark"
                checked={themeMode === 'dark'}
                onChange={() => handleThemeModeChange('dark')}
              />
              <div className="option-content">
                <span className="option-icon">🌙</span>
                <div className="option-text">
                  <span className="option-title">ダークモード</span>
                  <span className="option-description">暗い背景のテーマ</span>
                </div>
              </div>
            </label>

            <label className="theme-option">
              <input
                type="radio"
                name="theme-mode"
                value="custom"
                checked={themeMode === 'custom'}
                onChange={() => handleThemeModeChange('custom')}
              />
              <div className="option-content">
                <span className="option-icon">🎨</span>
                <div className="option-text">
                  <span className="option-title">カスタムモード</span>
                  <span className="option-description">自分好みの色にカスタマイズ</span>
                </div>
              </div>
            </label>
          </div>
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="custom-theme-section">
          {themeMode !== 'custom' && (
            <div className="custom-notice">
              💡 カスタムテーマを使用するには、テーマモードで「カスタムモード」を選択してください
            </div>
          )}

          <div className="color-groups">
            <div className="color-group">
              <h4>アクセントカラー</h4>
              <div className="color-items">
                <div className="color-item">
                  <label htmlFor="accent-primary">プライマリ</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      id="accent-primary"
                      value={theme.colors.accent.primary}
                      onChange={(e) => handleColorChange('accent', 'primary', e.target.value)}
                      disabled={themeMode !== 'custom'}
                    />
                    <input
                      type="text"
                      value={theme.colors.accent.primary}
                      onChange={(e) => handleColorChange('accent', 'primary', e.target.value)}
                      disabled={themeMode !== 'custom'}
                      className="color-text"
                    />
                  </div>
                </div>
                <div className="color-item">
                  <label htmlFor="accent-secondary">セカンダリ</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      id="accent-secondary"
                      value={theme.colors.accent.secondary}
                      onChange={(e) => handleColorChange('accent', 'secondary', e.target.value)}
                      disabled={themeMode !== 'custom'}
                    />
                    <input
                      type="text"
                      value={theme.colors.accent.secondary}
                      onChange={(e) => handleColorChange('accent', 'secondary', e.target.value)}
                      disabled={themeMode !== 'custom'}
                      className="color-text"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="color-group">
              <h4>ステータスカラー</h4>
              <div className="color-items">
                <div className="color-item">
                  <label htmlFor="status-profit">利益</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      id="status-profit"
                      value={theme.colors.status.profit}
                      onChange={(e) => handleColorChange('status', 'profit', e.target.value)}
                      disabled={themeMode !== 'custom'}
                    />
                    <input
                      type="text"
                      value={theme.colors.status.profit}
                      onChange={(e) => handleColorChange('status', 'profit', e.target.value)}
                      disabled={themeMode !== 'custom'}
                      className="color-text"
                    />
                  </div>
                </div>
                <div className="color-item">
                  <label htmlFor="status-loss">損失</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      id="status-loss"
                      value={theme.colors.status.loss}
                      onChange={(e) => handleColorChange('status', 'loss', e.target.value)}
                      disabled={themeMode !== 'custom'}
                    />
                    <input
                      type="text"
                      value={theme.colors.status.loss}
                      onChange={(e) => handleColorChange('status', 'loss', e.target.value)}
                      disabled={themeMode !== 'custom'}
                      className="color-text"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="color-group">
              <h4>背景カラー</h4>
              <div className="color-items">
                <div className="color-item">
                  <label htmlFor="background-primary">プライマリ</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      id="background-primary"
                      value={theme.colors.background.primary}
                      onChange={(e) => handleColorChange('background', 'primary', e.target.value)}
                      disabled={themeMode !== 'custom'}
                    />
                    <input
                      type="text"
                      value={theme.colors.background.primary}
                      onChange={(e) => handleColorChange('background', 'primary', e.target.value)}
                      disabled={themeMode !== 'custom'}
                      className="color-text"
                    />
                  </div>
                </div>
                <div className="color-item">
                  <label htmlFor="background-secondary">セカンダリ</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      id="background-secondary"
                      value={theme.colors.background.secondary}
                      onChange={(e) => handleColorChange('background', 'secondary', e.target.value)}
                      disabled={themeMode !== 'custom'}
                    />
                    <input
                      type="text"
                      value={theme.colors.background.secondary}
                      onChange={(e) => handleColorChange('background', 'secondary', e.target.value)}
                      disabled={themeMode !== 'custom'}
                      className="color-text"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="theme-actions">
            <button
              className="reset-button"
              onClick={handleResetCustomTheme}
              disabled={themeMode !== 'custom'}
            >
              初期値にリセット
            </button>
          </div>
        </div>
      )}
    </div>
  );
}