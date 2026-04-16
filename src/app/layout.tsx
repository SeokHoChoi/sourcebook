import './globals.css';

import type { Metadata } from 'next';

import { DEFAULT_APP_NAME } from '@/lib/app-config';

export const metadata: Metadata = {
  title: {
    default: DEFAULT_APP_NAME,
    template: `%s | ${DEFAULT_APP_NAME}`,
  },
  description: 'Official-docs-first learning and reference workspace for Sourcebook.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
