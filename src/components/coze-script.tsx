"use client";

import Script from "next/script";

export function CozeScript() {
  return (
    <Script
      src="https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.20/libs/cn/index.js"
      strategy="afterInteractive"
      onLoad={() => {
        window.dispatchEvent(new Event("coze-sdk-ready"));
      }}
    />
  );
}
