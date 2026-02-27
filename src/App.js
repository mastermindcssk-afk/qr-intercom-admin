import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import IntercomAdminRoutes from './pages/intercom/IntercomAdminRoutes';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary:    { main: '#0ea5e9', light: '#38bdf8', dark: '#0284c7', 50: '#f0f9ff', 100: '#e0f2fe', contrastText: '#fff' },
    secondary:  { main: '#6366f1' },
    success:    { main: '#10b981', light: '#34d399', dark: '#059669' },
    error:      { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
    warning:    { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    background: { default: '#f1f5f9', paper: '#ffffff' },
    divider:    '#e2e8f0',
    text: { primary: '#0f172a', secondary: '#64748b' },
  },
  typography: {
    fontFamily: '"Figtree", "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 800, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', fontWeight: 600, borderRadius: 10,
          fontSize: '0.875rem', letterSpacing: '-0.01em',
        },
        contained: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          '&:hover': { boxShadow: '0 4px 12px rgba(14,165,233,0.3)' },
        },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiTableCell: { styleOverrides: { root: { borderColor: '#f1f5f9', padding: '10px 16px' } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '& fieldset': { borderColor: '#e2e8f0' },
          '&:hover fieldset': { borderColor: '#cbd5e1' },
        },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 20, boxShadow: '0 24px 64px rgba(15,23,42,0.18)' } } },
    MuiListItemButton: { styleOverrides: { root: { borderRadius: 10 } } },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={4} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} autoHideDuration={3000}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/intercom" replace />} />
            {IntercomAdminRoutes}
            <Route path="*" element={<Navigate to="/intercom" replace />} />
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
