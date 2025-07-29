import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeMode, lightTheme, darkTheme, defaultCustomTheme, ColorPalette } from '../types/Theme';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  updateCustomTheme: (colors: Partial<ColorPalette>) => void;
  resetCustomTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ローカルストレージのキー
const THEME_MODE_KEY = 'profit-calendar-theme-mode';
const CUSTOM_THEME_KEY = 'profit-calendar-custom-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // 保存されたテーマモードを取得
  const savedThemeMode = localStorage.getItem(THEME_MODE_KEY) as ThemeMode | null;
  const savedCustomTheme = localStorage.getItem(CUSTOM_THEME_KEY);
  
  const [themeMode, setThemeModeState] = useState<ThemeMode>(savedThemeMode || 'light');
  const [customTheme, setCustomTheme] = useState<Theme>(
    savedCustomTheme ? JSON.parse(savedCustomTheme) : defaultCustomTheme
  );

  // 現在のテーマを取得
  const getCurrentTheme = (): Theme => {
    switch (themeMode) {
      case 'light':
        return lightTheme;
      case 'dark':
        return darkTheme;
      case 'custom':
        return customTheme;
      default:
        return lightTheme;
    }
  };

  const [theme, setTheme] = useState<Theme>(getCurrentTheme());

  // テーマモードが変更されたときの処理
  useEffect(() => {
    const newTheme = getCurrentTheme();
    setTheme(newTheme);
    localStorage.setItem(THEME_MODE_KEY, themeMode);
    
    // CSS変数を更新
    updateCSSVariables(newTheme.colors);
    
    // body要素にテーマクラスを追加
    document.body.className = `theme-${themeMode}`;
  }, [themeMode, customTheme]);

  // CSS変数を更新する関数
  const updateCSSVariables = (colors: ColorPalette) => {
    const root = document.documentElement;
    
    // 背景色
    root.style.setProperty('--bg-primary', colors.background.primary);
    root.style.setProperty('--bg-secondary', colors.background.secondary);
    root.style.setProperty('--bg-tertiary', colors.background.tertiary);
    root.style.setProperty('--bg-modal', colors.background.modal);
    
    // テキスト色
    root.style.setProperty('--text-primary', colors.text.primary);
    root.style.setProperty('--text-secondary', colors.text.secondary);
    root.style.setProperty('--text-tertiary', colors.text.tertiary);
    root.style.setProperty('--text-inverse', colors.text.inverse);
    
    // アクセントカラー
    root.style.setProperty('--accent-primary', colors.accent.primary);
    root.style.setProperty('--accent-primary-hover', colors.accent.primaryHover);
    root.style.setProperty('--accent-secondary', colors.accent.secondary);
    root.style.setProperty('--accent-secondary-hover', colors.accent.secondaryHover);
    
    // ステータスカラー
    root.style.setProperty('--status-profit', colors.status.profit);
    root.style.setProperty('--status-loss', colors.status.loss);
    root.style.setProperty('--status-warning', colors.status.warning);
    root.style.setProperty('--status-info', colors.status.info);
    
    // ボーダー
    root.style.setProperty('--border-primary', colors.border.primary);
    root.style.setProperty('--border-secondary', colors.border.secondary);
    
    // シャドウ
    root.style.setProperty('--shadow-primary', colors.shadow.primary);
    root.style.setProperty('--shadow-secondary', colors.shadow.secondary);
  };

  // テーマモードを設定
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  // カスタムテーマを更新
  const updateCustomTheme = (colors: Partial<ColorPalette>) => {
    const updatedTheme: Theme = {
      ...customTheme,
      colors: {
        ...customTheme.colors,
        background: { ...customTheme.colors.background, ...colors.background },
        text: { ...customTheme.colors.text, ...colors.text },
        accent: { ...customTheme.colors.accent, ...colors.accent },
        status: { ...customTheme.colors.status, ...colors.status },
        border: { ...customTheme.colors.border, ...colors.border },
        shadow: { ...customTheme.colors.shadow, ...colors.shadow },
      },
    };
    
    setCustomTheme(updatedTheme);
    localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(updatedTheme));
  };

  // カスタムテーマをリセット
  const resetCustomTheme = () => {
    setCustomTheme(defaultCustomTheme);
    localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(defaultCustomTheme));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        setThemeMode,
        updateCustomTheme,
        resetCustomTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// テーマフック
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}