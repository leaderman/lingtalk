"use client";

import { useEffect } from "react";

const BOT_ID = "7621087393454145582";
const TOKEN = "pat_Bku42cXAmMebJL3c2alZJDMjnx6mdzY4hL6dds2lLXTCJI3GYxBwlkLIARTl0YAv";

export default function Chat() {
  useEffect(() => {
    new (window as any).CozeWebSDK.WebChatClient({
      config: {
        bot_id: BOT_ID,
      },
      auth: {
        type: "token",
        token: TOKEN,
        onRefreshToken: () => TOKEN,
      },
    });
  }, []);

  return null;
}
