import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { CozeScript } from '@/components/coze-script';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '灵语 - 智能客服平台',
    template: '%s | 灵语',
  },
  description: '基于字节扣子 Chat SDK 的智能客服平台',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
        <CozeScript />
      </body>
    </html>
  );
}
