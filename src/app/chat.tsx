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
        ui: {
          base: {
            layout: "mobile",
            lang: "zh-CN",
          },
          asstBtn: {
            isNeed: false,
          },
          header: {
            isShow: false,
            isNeedClose: false,
          },
          footer: {
            isShow: false,
          },
          conversations: {
            isNeed: true,
          },
          chatBot: {
            uploadable: false,
          },
        },
      });

      // 初始化完成后自动显示聊天框
      cozeWebSDK.showChatBot();
    };

    if ((window as any).CozeWebSDK) {
      initChat();
      return;
    }

    window.addEventListener("coze-sdk-ready", initChat);
    return () => window.removeEventListener("coze-sdk-ready", initChat);
  }, []);

  return null;
}
