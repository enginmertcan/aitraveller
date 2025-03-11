import { createTheme } from '@mui/material/styles';
import { useThemeContext } from '../../context/ThemeContext';

const getTheme = (isDarkMode: boolean) => createTheme({
  palette: {
    mode: isDarkMode ? 'dark' : 'light',
    primary: {
      main: isDarkMode ? '#93c5fd' : '#2563eb',
      light: isDarkMode ? '#60a5fa' : '#3b82f6',
      dark: isDarkMode ? '#1d4ed8' : '#1e40af',
      contrastText: isDarkMode ? '#fff' : '#fff',
    },
    secondary: {
      main: isDarkMode ? '#a78bfa' : '#7c3aed',
      light: isDarkMode ? '#c4b5fd' : '#8b5cf6',
      dark: isDarkMode ? '#6d28d9' : '#5b21b6',
      contrastText: isDarkMode ? '#fff' : '#fff',
    },
    background: {
      default: isDarkMode ? '#121212' : '#f3f4f6',
      paper: isDarkMode ? '#1f2937' : '#ffffff',
    },
    text: {
      primary: isDarkMode ? '#e5e7eb' : '#111827',
      secondary: isDarkMode ? '#9ca3af' : '#4b5563',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          backgroundColor: isDarkMode ? '#121212' : '#f3f4f6',
          color: isDarkMode ? '#e5e7eb' : '#111827',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
      },
    },
  },
});

export { getTheme }; 