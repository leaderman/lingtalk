"use client";

import { useEffect } from "react";

const BOT_ID = "7621087393454145582";
const TOKEN = "pat_Bku42cXAmMebJL3c2alZJDMjnx6mdzY4hL6dds2lLXTCJI3GYxBwlkLIARTl0YAv";

export default function Chat() {
  useEffect(() => {
    const initChat = () => {
      const cozeWebSDK = new (window as any).CozeWebSDK.WebChatClient({
        config: {
          bot_id: BOT_ID,
        },
        auth: {
          type: "token",
          token: TOKEN,
          onRefreshToken: () => TOKEN,
        },
      });
    };

    // 如果 SDK 已加载，直接初始化
    if ((window as any).CozeWebSDK) {
      initChat();
      return;
    }

    // 否则等待 SDK 加载完成
    window.addEventListener("coze-sdk-ready", initChat);
    return () => window.removeEventListener("coze-sdk-ready", initChat);
  }, []);

  return null;
}
