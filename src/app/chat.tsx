"use client";

import { useEffect } from "react";

const BOT_ID = "7621087393454145582";
const TOKEN = "pat_Bku42cXAmMebJL3c2alZJDMjnx6mdzY4hL6dds2lLXTCJI3GYxBwlkLIARTl0YAv";

export default function Chat() {
  useEffect(() => {
    const init = () => {
      if (typeof window === "undefined" || !(window as any).CozeWebSDK) {
        setTimeout(init, 100);
        return;
      }

      const CozeWebSDK = (window as any).CozeWebSDK;

      new CozeWebSDK.WebChatClient({
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

    init();
  }, []);

  return null;
}
