// 字节扣子 Chat SDK 类型声明

declare global {
  interface Window {
    CozeWebSDK?: {
      WebChatClient: new (config: CozeWebChatConfig) => CozeWebChatClient;
    };
  }
}

interface CozeWebChatConfig {
  config: {
    bot_id: string;
  };
  componentProps?: {
    title?: string;
    icon?: string;
  };
  ui?: {
    base?: {
      zIndex?: number;
    };
  };
  auth?: {
    type: 'token' | 'jwt';
    token?: string;
    jwt?: string;
  };
  onError?: (error: Error) => void;
  onMessageReceive?: (message: string) => void;
}

interface CozeWebChatClient {
  openChat: () => void;
  closeChat: () => void;
  destroy: () => void;
  updateToken: (token: string) => void;
  sendMessage: (message: string) => void;
  clearConversation: () => void;
}

export {};
