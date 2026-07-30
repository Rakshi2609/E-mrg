import type { Metadata, Viewport } from 'next';
import { Rajdhani, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ServiceWorkerRegistration } from '../components/ServiceWorkerRegistration';

const rajdhani = Rajdhani({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'],
  variable: '--font-primary'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono'
});

export const metadata: Metadata = {
  title: 'E-MRG - AI Dispatcher Copilot',
  description: 'AI-powered emergency dispatch copilot providing real-time transcripts, geolocation, and severity assessment.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'E-MRG' },
  icons: { icon: '/icons/emrg-icon.svg', apple: '/icons/emrg-icon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#ef4444',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${rajdhani.variable} ${jetbrainsMono.variable}`}>
      <body style={{ fontFamily: 'var(--font-primary), sans-serif' }}>
        <Providers>
          <ServiceWorkerRegistration />
          {children}
        </Providers>
      </body>
    </html>
  );
}
