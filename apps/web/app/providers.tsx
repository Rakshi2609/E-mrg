'use client';
import { ThemeProvider } from 'next-themes';
import { LiveDataProvider } from '../context/LiveDataContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false} forcedTheme="light">
      <LiveDataProvider>
        {children}
      </LiveDataProvider>
    </ThemeProvider>
  );
}

