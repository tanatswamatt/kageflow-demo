import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { SITE } from '@/lib/site';

const display = localFont({
  src: [
    { path: './fonts/archivo-latin-600-normal.woff2', weight: '600' },
    { path: './fonts/archivo-latin-700-normal.woff2', weight: '700' },
    { path: './fonts/archivo-latin-800-normal.woff2', weight: '800' },
    { path: './fonts/archivo-latin-900-normal.woff2', weight: '900' },
  ],
  variable: '--font-display',
  display: 'swap',
});

const body = localFont({
  src: [
    { path: './fonts/inter-latin-400-normal.woff2', weight: '400' },
    { path: './fonts/inter-latin-500-normal.woff2', weight: '500' },
    { path: './fonts/inter-latin-600-normal.woff2', weight: '600' },
    { path: './fonts/inter-latin-700-normal.woff2', weight: '700' },
  ],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: `Browse quality pre-owned cars at ${SITE.name}. A Kageflow demo dealership: live stock, enquiries and reservations managed in Kageflow.`,
  // A demo site should not compete with real dealers in search.
  robots: { index: false, follow: false },
};

export const viewport = { themeColor: '#10151F' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
