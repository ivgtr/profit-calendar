// テーマの種類
export type ThemeMode = 'light' | 'dark' | 'custom';

// カラーパレット
export interface ColorPalette {
  // 背景色
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    modal: string;
  };
  
  // テキスト色
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  
  // アクセントカラー
  accent: {
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
  };
  
  // ステータスカラー
  status: {
    profit: string;
    loss: string;
    warning: string;
    info: string;
  };
  
  // ボーダー
  border: {
    primary: string;
    secondary: string;
  };
  
  // シャドウ
  shadow: {
    primary: string;
    secondary: string;
  };
}

// テーマ設定
export interface Theme {
  mode: ThemeMode;
  colors: ColorPalette;
}

// プリセットテーマ
export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      tertiary: '#e9ecef',
      modal: 'rgba(0, 0, 0, 0.5)',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      tertiary: '#999999',
      inverse: '#ffffff',
    },
    accent: {
      primary: '#667eea',
      primaryHover: '#5a6fd8',
      secondary: '#764ba2',
      secondaryHover: '#6a4190',
    },
    status: {
      profit: '#28a745',
      loss: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8',
    },
    border: {
      primary: '#dee2e6',
      secondary: '#e9ecef',
    },
    shadow: {
      primary: '0 2px 4px rgba(0, 0, 0, 0.1)',
      secondary: '0 4px 8px rgba(0, 0, 0, 0.15)',
    },
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: {
      primary: '#1a1a1a',
      secondary: '#242424',
      tertiary: '#2d2d2d',
      modal: 'rgba(0, 0, 0, 0.8)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
      tertiary: '#999999',
      inverse: '#1a1a1a',
    },
    accent: {
      primary: '#667eea',
      primaryHover: '#7b92ff',
      secondary: '#764ba2',
      secondaryHover: '#8a5eb8',
    },
    status: {
      profit: '#3490dc',
      loss: '#ef4444',
      warning: '#f59e0b',
      info: '#06b6d4',
    },
    border: {
      primary: 'rgba(255, 255, 255, 0.1)',
      secondary: 'rgba(255, 255, 255, 0.05)',
    },
    shadow: {
      primary: '0 2px 4px rgba(0, 0, 0, 0.3)',
      secondary: '0 4px 8px rgba(0, 0, 0, 0.4)',
    },
  },
};

// カスタムテーマのデフォルト値
export const defaultCustomTheme: Theme = {
  mode: 'custom',
  colors: {
    background: {
      primary: '#1e1e2e',
      secondary: '#313244',
      tertiary: '#45475a',
      modal: 'rgba(0, 0, 0, 0.7)',
    },
    text: {
      primary: '#cdd6f4',
      secondary: '#a6adc8',
      tertiary: '#7f849c',
      inverse: '#1e1e2e',
    },
    accent: {
      primary: '#89b4fa',
      primaryHover: '#9dc0ff',
      secondary: '#cba6f7',
      secondaryHover: '#d7b3ff',
    },
    status: {
      profit: '#a6e3a1',
      loss: '#f38ba8',
      warning: '#f9e2af',
      info: '#94e2d5',
    },
    border: {
      primary: 'rgba(205, 214, 244, 0.1)',
      secondary: 'rgba(205, 214, 244, 0.05)',
    },
    shadow: {
      primary: '0 2px 4px rgba(0, 0, 0, 0.4)',
      secondary: '0 4px 8px rgba(0, 0, 0, 0.5)',
    },
  },
};