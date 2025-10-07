import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a', // Deep blue for banking
      light: '#3b82f6',
      dark: '#1e40af',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#059669', // Green for success/approval
      light: '#10b981',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626', // Red for errors/rejection
      light: '#ef4444',
      dark: '#b91c1c',
    },
    warning: {
      main: '#d97706', // Orange for warnings
      light: '#f59e0b',
      dark: '#b45309',
    },
    info: {
      main: '#0ea5e9', // Light blue for info
      light: '#38bdf8',
      dark: '#0284c7',
    },
    background: {
      default: '#f8fafc', // Light gray background
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937', // Dark gray text
      secondary: '#6b7280', // Medium gray text
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      fontFamily: '"DM Sans", sans-serif',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      fontFamily: '"DM Sans", sans-serif',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      fontFamily: '"DM Sans", sans-serif',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      fontFamily: '"DM Sans", sans-serif',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      fontFamily: '"DM Sans", sans-serif',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      fontFamily: '"DM Sans", sans-serif',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontFamily: '"Inter", sans-serif',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      fontFamily: '"Inter", sans-serif',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      fontFamily: '"Inter", sans-serif',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      fontFamily: '"DM Sans", sans-serif',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.4,
      fontFamily: '"DM Sans", sans-serif',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          '& .MuiStepLabel-label': {
            fontSize: '0.875rem',
            fontWeight: 500,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1f2937',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});
