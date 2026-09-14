import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: { mode: 'light', primary: { main: '#135c43', dark: '#0c3f2d' }, secondary: { main: '#d29a2e' }, background: { default: '#f4f6f2', paper: '#ffffff' } },
  typography: { fontFamily: 'Inter, "Noto Sans Sinhala", system-ui, sans-serif', h1: { fontWeight: 750 }, h2: { fontWeight: 700 }, h5: { fontWeight: 700 }, button: { textTransform: 'none', fontWeight: 650 } },
  shape: { borderRadius: 12 }, components: { MuiCard: { styleOverrides: { root: { boxShadow: '0 8px 28px rgba(18,71,52,.07)', border: '1px solid rgba(18,71,52,.08)' } } }, MuiButton: { defaultProps: { disableElevation: true } } },
});

