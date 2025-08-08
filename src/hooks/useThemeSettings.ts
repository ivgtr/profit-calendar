import { useState, useCallback } from 'react';
import { useTheme } from './useTheme';
import { ThemeMode } from '../types/Theme';

export type TabType = 'mode' | 'custom';

export function useThemeSettings() {
  const { theme, themeMode, setThemeMode, updateCustomTheme, resetCustomTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('mode');

  const handleThemeModeChange = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
  }, [setThemeMode]);

  const handleColorChange = useCallback((
    category: 'accent' | 'status' | 'background',
    subcategory: string,
    value: string
  ) => {
    updateCustomTheme({
      ...theme.colors,
      [category]: {
        ...theme.colors[category],
        [subcategory]: value
      }
    });
  }, [theme.colors, updateCustomTheme]);

  const handleResetCustomTheme = useCallback(() => {
    if (confirm('カスタムテーマを初期値にリセットしますか？')) {
      resetCustomTheme();
    }
  }, [resetCustomTheme]);

  return {
    // State
    theme,
    themeMode,
    activeTab,
    
    // Actions
    setActiveTab,
    handleThemeModeChange,
    handleColorChange,
    handleResetCustomTheme,
  };
}