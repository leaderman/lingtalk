import type { Metadata } from 'next';
import { ChatInterface } from '@/components/chat/chat-interface';

export const metadata: Metadata = {
  title: 'AI 聊天助手',
  description: '基于字节扣子 Chat SDK 的智能聊天应用',
};

export default function Home() {
  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      <ChatInterface />
    </div>
  );
}
