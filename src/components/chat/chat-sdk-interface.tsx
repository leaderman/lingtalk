"use client";

import { useEffect, useRef } from "react";

// 固定配置
const BOT_ID = "7621087393454145582";
const TOKEN = "pat_Bku42cXAmMebJL3c2alZJDMjnx6mdzY4hL6dds2lLXTCJI3GYxBwlkLIARTl0YAv";

// SDK 类型声明
declare global {
  interface Window {
    CozeWebSDK?: {
      WebChatClient: new (config: CozeWebChatConfig) => CozeWebChatClient;
    };
  }
}

interface CozeWebChatConfig {
  config: {
    type?: "bot" | "agent";
    bot_id: string;
  };
  componentProps?: {
    title?: string;
    icon?: string;
  };
  ui?: {
    base?: {
      zIndex?: number;
      width?: string;
      height?: string;
      maxWidth?: string;
      maxHeight?: string;
    };
    chatBot?: {
      title?: string;
      width?: string;
      height?: string;
    };
  };
  auth?: {
    type: "token" | "jwt";
    token?: string;
    onRefreshToken?: () => string | Promise<string>;
  };
  chatConfig?: {
    auto_open_chatpanel?: boolean;
  };
  onError?: (error: Error) => void;
  onReady?: () => void;
}

interface CozeWebChatClient {
  openChat: () => void;
  closeChat: () => void;
  destroy: () => void;
  updateToken: (token: string) => void;
}

export function ChatSDKInterface() {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<CozeWebChatClient | null>(null);

  useEffect(() => {
    // 等待 SDK 加载
    const initClient = () => {
      if (typeof window === "undefined" || !window.CozeWebSDK) {
        setTimeout(initClient, 100);
        return;
      }

      try {
        clientRef.current = new window.CozeWebSDK.WebChatClient({
          config: {
            type: "bot",
            bot_id: BOT_ID,
          },
          componentProps: {
            title: "扣子 AI 助手",
          },
          auth: {
            type: "token",
            token: TOKEN,
            onRefreshToken: () => TOKEN,
          },
          ui: {
            base: {
              zIndex: 1000,
              width: "100%",
              height: "100%",
            },
            chatBot: {
              title: "扣子 AI 助手",
            },
          },
          chatConfig: {
            auto_open_chatpanel: true,
          },
          onError: (error) => {
            console.error("Coze Chat Error:", error);
          },
          onReady: () => {
            console.log("Coze Chat Ready");
          },
        });
      } catch (error) {
        console.error("Init error:", error);
      }
    };

    initClient();

    return () => {
      if (clientRef.current) {
        clientRef.current.destroy();
        clientRef.current = null;
      }
    };
  }, []);

  // 返回一个容器，SDK 会将聊天面板渲染到这里
  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      id="coze-chat-container"
    />
  );
}
