"use client";

import { useEffect, useRef } from "react";

// 固定配置
const BOT_ID = "7621087393454145582";
const TOKEN = "pat_Bku42cXAmMebJL3c2alZJDMjnx6mdzY4hL6dds2lLXTCJI3GYxBwlkLIARTl0YAv";

export function ChatSDKInterface() {
  const clientRef = useRef<any>(null);

  useEffect(() => {
    const initChat = () => {
      if (typeof window === "undefined" || !(window as any).CozeWebSDK) {
        setTimeout(initChat, 100);
        return;
      }

      const CozeWebSDK = (window as any).CozeWebSDK;

      clientRef.current = new CozeWebSDK.WebChatClient({
        config: {
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
          },
        },
        onReady: () => {
          // 自动打开聊天面板
          clientRef.current?.openChat?.();
        },
      });
    };

    initChat();

    return () => {
      if (clientRef.current) {
        clientRef.current.destroy?.();
      }
    };
  }, []);

  return null;
}
