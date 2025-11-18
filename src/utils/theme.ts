import { createTheme, PaletteMode } from '@mui/material/styles';

// 共通のタイポグラフィ設定
const typography = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
};

// ライトテーマ
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#e33371',
      dark: '#9a0036',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography,
});

// ダークテーマ - Material Design 3とゲーミングアプリのベストプラクティスに基づく
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5e92f3', // 彩度を20ポイント下げた青
      light: '#8bb4f6',
      dark: '#2a5ccc',
    },
    secondary: {
      main: '#f06292', // 彩度を下げたピンク
      light: '#f48fb1',
      dark: '#ba2d65',
    },
    background: {
      default: '#0a0e1a', // #121212に青味を加えた色
      paper: '#1a1f2e',   // カード背景用
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.88)', // 見出し用
      secondary: 'rgba(255, 255, 255, 0.7)', // 本文用
      disabled: 'rgba(255, 255, 255, 0.38)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    // カスタムカラー
    grey: {
      50: '#f5f5f5',
      100: '#e0e0e0',
      200: '#bdbdbd',
      300: '#9e9e9e',
      400: '#757575',
      500: '#616161',
      600: '#424242',
      700: '#303030',
      800: '#212121',
      900: '#121212',
    },
    // ゲーム特有のアクセントカラー
    info: {
      main: '#64b5f6', // 明度を上げた青
      light: '#90caf9',
      dark: '#2196f3',
    },
    success: {
      main: '#81c784', // 明度を上げた緑
      light: '#a5d6a7',
      dark: '#4caf50',
    },
    warning: {
      main: '#ffb74d', // 明度を上げたオレンジ
      light: '#ffcc80',
      dark: '#f57c00',
    },
    error: {
      main: '#e57373', // 明度を上げた赤
      light: '#ef9a9a',
      dark: '#d32f2f',
    },
  },
  typography,
  components: {
    // ダークモード時のコンポーネント別カスタマイズ
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1a1f2e',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.23)',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.4)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.23)',
        },
        outlined: {
          '&.MuiChip-colorPrimary': {
            borderColor: '#5e92f3',
            color: '#8bb4f6',
          },
          '&.MuiChip-colorSecondary': {
            borderColor: '#f06292',
            color: '#f48fb1',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export const getTheme = (mode: PaletteMode) => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

export { lightTheme, darkTheme };