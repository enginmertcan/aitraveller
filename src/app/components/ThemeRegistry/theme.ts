import { createTheme } from '@mui/material/styles';
import { Inter } from 'next/font/google';

const inter = Inter({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
});

// Define consistent colors
const colors = {
  primary: {
    light: '#93c5fd',
    main: '#2563eb',
    dark: '#1d4ed8',
  },
  secondary: {
    light: '#a78bfa',
    main: '#7c3aed',
    dark: '#6d28d9',
  },
  success: {
    light: '#86efac',
    main: '#22c55e',
    dark: '#16a34a',
  },
  error: {
    light: '#fca5a5',
    main: '#ef4444',
    dark: '#dc2626',
  },
  warning: {
    light: '#fdba74',
    main: '#f97316',
    dark: '#ea580c',
  },
  info: {
    light: '#93c5fd',
    main: '#3b82f6',
    dark: '#2563eb',
  },
  dark: {
    background: '#121212',
    paper: '#1e1e1e',
    card: 'rgba(45, 45, 45, 0.8)',
    section: 'rgba(30, 30, 30, 0.8)',
    text: {
      primary: '#e5e7eb',
      secondary: '#9ca3af',
      muted: 'rgba(255, 255, 255, 0.7)',
    },
    border: 'rgba(255, 255, 255, 0.1)',
  },
  light: {
    background: '#f3f4f6',
    paper: '#ffffff',
    card: 'rgba(255, 255, 255, 0.8)',
    section: 'rgba(255, 255, 255, 0.8)',
    text: {
      primary: '#111827',
      secondary: '#4b5563',
      muted: 'rgba(0, 0, 0, 0.6)',
    },
    border: 'rgba(0, 0, 0, 0.1)',
  },
  gradients: {
    primary: 'linear-gradient(45deg, #2563eb, #7c3aed)',
    primaryHover: 'linear-gradient(45deg, #1d4ed8, #6d28d9)',
    background: {
      light: 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)',
      dark: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    },
  },
};

// Define consistent spacing
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Define consistent border radius
const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: '50%',
};

// Define consistent shadows
const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  dark: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.2)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  },
};

const getTheme = (isDarkMode: boolean) => createTheme({
  palette: {
    mode: isDarkMode ? 'dark' : 'light',
    primary: {
      light: colors.primary.light,
      main: isDarkMode ? colors.primary.light : colors.primary.main,
      dark: colors.primary.dark,
      contrastText: '#fff',
    },
    secondary: {
      light: colors.secondary.light,
      main: isDarkMode ? colors.secondary.light : colors.secondary.main,
      dark: colors.secondary.dark,
      contrastText: '#fff',
    },
    success: {
      light: colors.success.light,
      main: isDarkMode ? colors.success.light : colors.success.main,
      dark: colors.success.dark,
    },
    error: {
      light: colors.error.light,
      main: isDarkMode ? colors.error.light : colors.error.main,
      dark: colors.error.dark,
    },
    warning: {
      light: colors.warning.light,
      main: isDarkMode ? colors.warning.light : colors.warning.main,
      dark: colors.warning.dark,
    },
    info: {
      light: colors.info.light,
      main: isDarkMode ? colors.info.light : colors.info.main,
      dark: colors.info.dark,
    },
    background: {
      default: isDarkMode ? colors.dark.background : colors.light.background,
      paper: isDarkMode ? colors.dark.paper : colors.light.paper,
    },
    text: {
      primary: isDarkMode ? colors.dark.text.primary : colors.light.text.primary,
      secondary: isDarkMode ? colors.dark.text.secondary : colors.light.text.secondary,
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h1: {
      fontWeight: 800,
      fontSize: '3rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 800,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
      lineHeight: 1.5,
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: borderRadius.md,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          backgroundColor: isDarkMode ? colors.dark.background : colors.light.background,
          color: isDarkMode ? colors.dark.text.primary : colors.light.text.primary,
          transition: 'background-color 0.3s ease, color 0.3s ease',
        },
        '::selection': {
          backgroundColor: isDarkMode ? colors.primary.light : colors.primary.main,
          color: '#fff',
        },
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        '::-webkit-scrollbar-thumb': {
          background: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${isDarkMode ? colors.dark.border : colors.light.border}`,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: borderRadius.md,
          fontWeight: 600,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: isDarkMode ? shadows.dark.md : shadows.md,
          },
        },
        containedPrimary: {
          background: colors.gradients.primary,
          '&:hover': {
            background: colors.gradients.primaryHover,
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: isDarkMode ? shadows.dark.lg : shadows.lg,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: borderRadius.lg,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.md,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: isDarkMode ? shadows.dark.sm : shadows.sm,
            },
            '&.Mui-focused': {
              boxShadow: isDarkMode ? shadows.dark.md : shadows.md,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
          fontWeight: 500,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          margin: '2px 4px',
          '&:hover': {
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          },
          '&.Mui-selected': {
            backgroundColor: isDarkMode ? 'rgba(147, 197, 253, 0.15)' : 'rgba(37, 99, 235, 0.1)',
            '&:hover': {
              backgroundColor: isDarkMode ? 'rgba(147, 197, 253, 0.25)' : 'rgba(37, 99, 235, 0.15)',
            },
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: isDarkMode ? colors.dark.paper : colors.light.paper,
          color: isDarkMode ? colors.dark.text.primary : colors.light.text.primary,
          boxShadow: isDarkMode ? shadows.dark.lg : shadows.lg,
          borderRadius: borderRadius.md,
          padding: '8px 12px',
          fontSize: '0.75rem',
          border: `1px solid ${isDarkMode ? colors.dark.border : colors.light.border}`,
        },
      },
    },
  },
});

// Export theme and design tokens for use throughout the app
export { getTheme, colors, spacing, borderRadius, shadows };