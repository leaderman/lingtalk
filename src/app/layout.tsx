import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { CozeScript } from '@/components/coze-script';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '扣子 AI 聊天 | Coze Chat',
    template: '%s | Coze Chat',
  },
  description: '基于字节扣子 Chat SDK 的智能聊天应用',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
        <CozeScript />
      </body>
    </html>
  );
}
