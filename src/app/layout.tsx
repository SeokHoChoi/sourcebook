import './globals.css';

import type { Metadata } from 'next';

import { DEFAULT_APP_NAME } from '@/lib/app-config';

export const metadata: Metadata = {
  title: {
    default: DEFAULT_APP_NAME,
    template: `%s | ${DEFAULT_APP_NAME}`,
  },
  description: '공식 문서 원문과 학습 오버레이를 함께 쌓는 로컬 우선 학습 저장소.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
