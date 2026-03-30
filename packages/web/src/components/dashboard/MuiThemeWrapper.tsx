import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useAppSelector } from '@/store/hooks';
import { selectTheme } from '@/store/uiSlice';
import type { ReactNode } from 'react';

interface Props { children: ReactNode; }

export function MuiThemeWrapper({ children }: Props) {
  const theme = useAppSelector(selectTheme);
  const muiTheme = createTheme({ palette: { mode: theme } });
  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
}
