import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ReactQueryProvider } from '@/components/providers/react-query-provider';

export const metadata: Metadata = {
  title: 'Expense Manager UI Kit',
  description: 'Static mobile UI screens reconstructed from the Expense Manager Figma screenshots.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen overflow-x-hidden bg-[#070b12] font-sans text-slate-100 antialiased selection:bg-primary selection:text-slate-950">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}

