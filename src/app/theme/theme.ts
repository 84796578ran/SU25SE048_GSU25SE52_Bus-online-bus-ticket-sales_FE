'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#F48FB1', // Light pink
      light: '#FCE4EC',
      dark: '#E91E63', // Darker pink for hover states
      contrastText: '#fff',
    },
    secondary: {
      main: '#E91E63', // Darker pink for secondary actions
      light: '#F48FB1',
      dark: '#C2185B',
      contrastText: '#fff',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    error: {
      main: '#FF5252',
    },
    warning: {
      main: '#FFB74D',
    },
    info: {
      main: '#64B5F6',
    },
    success: {
      main: '#81C784',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          boxShadow: '0 4px 14px 0 rgba(244, 143, 177, 0.2)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(233, 30, 99, 0.3)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #f48fb1 30%, #e91e63 90%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 8px 40px -12px rgba(244, 143, 177, 0.2)',
        },
      },
    },
  },
});

export default theme;
