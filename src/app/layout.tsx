import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Expense Manager UI Kit',
  description: 'Static mobile UI screens reconstructed from the Expense Manager Figma screenshots.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen overflow-x-hidden bg-[#070b12] font-sans text-slate-100 antialiased selection:bg-primary selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
