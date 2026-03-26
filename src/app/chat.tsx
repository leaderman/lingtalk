"use client";

import { useEffect } from "react";

const BOT_ID = "7621087393454145582";

export default function Chat() {
  useEffect(() => {
    // 获取或生成用户 ID
    let uid = localStorage.getItem("LINGTALK_UID");
    if (!uid) {
      uid = Array.from({ length: 16 }, () =>
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(
          Math.floor(Math.random() * 62)
        )
      ).join("");
      localStorage.setItem("LINGTALK_UID", uid);
    }

    // 获取 token 的函数
    const fetchToken = async () => {
      const response = await fetch(`/api/token?uid=${uid}`);
      const result = await response.json();
      if (result.code === 200) {
        return result.data;
      }
      throw new Error(result.msg || "Failed to get token");
    };

    const initChat = async () => {
      const token = await fetchToken();

      const cozeWebSDK = new (window as any).CozeWebSDK.WebChatClient({
        config: {
          bot_id: BOT_ID,
        },
        auth: {
          type: "token",
          token: token,
          onRefreshToken: () => fetchToken(),
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
            isNeed: false,
          },
          chatBot: {
            placeholder: "有问题，尽管问",
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

    const handleReady = () => {
      initChat();
      window.removeEventListener("coze-sdk-ready", handleReady);
    };
    window.addEventListener("coze-sdk-ready", handleReady);
  }, []);

  return null;
}
