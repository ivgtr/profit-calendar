import { useState, useCallback } from 'react';
import { useTheme } from './useTheme';
import { ThemeMode } from '../types/Theme';
import { useUI } from '../contexts/UIContext';

export type TabType = 'mode' | 'custom';

export function useThemeSettings() {
  const { showConfirm } = useUI();
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

  const handleResetCustomTheme = useCallback(async () => {
    const confirmed = await showConfirm({
      message: 'カスタムテーマを初期値にリセットしますか？',
      confirmText: 'リセット'
    });
    if (confirmed) {
      resetCustomTheme();
    }
  }, [resetCustomTheme, showConfirm]);

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