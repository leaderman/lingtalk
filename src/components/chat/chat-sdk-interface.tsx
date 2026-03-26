"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, User, Bot, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

// 固定配置
const BOT_ID = "7621087393454145582";
const TOKEN = "pat_Bku42cXAmMebJL3c2alZJDMjnx6mdzY4hL6dds2lLXTCJI3GYxBwlkLIARTl0YAv";

// SDK 类型声明
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
    };
  };
  auth?: {
    type: 'token' | 'jwt';
    token?: string;
    jwt?: string;
    onRefreshToken?: () => string | Promise<string>;
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

declare global {
  interface Window {
    CozeWebSDK?: {
      WebChatClient: new (config: CozeWebChatConfig) => CozeWebChatClient;
    };
  }
}

export function ChatSDKInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "你好！我是扣子 AI 助手，有什么我可以帮助你的吗？",
      id: "welcome",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const clientRef = useRef<CozeWebChatClient | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 等待 SDK 加载
  useEffect(() => {
    const checkSDK = setInterval(() => {
      if (typeof window !== "undefined" && window.CozeWebSDK) {
        setClientReady(true);
        clearInterval(checkSDK);
      }
    }, 100);

    return () => clearInterval(checkSDK);
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 自动调整 textarea 高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // 初始化 Chat Client
  useEffect(() => {
    if (!clientReady || !window.CozeWebSDK) return;

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
          },
        },
        onError: (error) => {
          console.error("Coze Chat Error:", error);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `出错了: ${error.message}`,
              id: Date.now().toString(),
            },
          ]);
        },
        onMessageReceive: (message) => {
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.role === "assistant") {
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMsg,
                  content: lastMsg.content + message,
                },
              ];
            }
            return [
              ...prev,
              {
                role: "assistant",
                content: message,
                id: Date.now().toString(),
              },
            ];
          });
        },
      });
    } catch (error) {
      console.error("Init error:", error);
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.destroy();
        clientRef.current = null;
      }
    };
  }, [clientReady]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !clientReady) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      id: Date.now().toString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch("https://api.coze.cn/v3/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          bot_id: BOT_ID,
          user_id: "user_" + Date.now(),
          additional_messages: [
            {
              role: "user",
              content: userMessage.content,
              content_type: "text",
            },
          ],
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantId = (Date.now() + 1).toString();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          id: assistantId,
        },
      ]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data:")) {
              const data = line.slice(5).trim();
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.event === "conversation.message.delta" && parsed.data?.content) {
                  assistantContent += parsed.data.content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, content: assistantContent } : m
                    )
                  );
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `出错啦: ${error instanceof Error ? error.message : "未知错误"}。`,
          id: (Date.now() + 1).toString(),
        },
      ]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, isLoading, clientReady]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content: "你好！我是扣子 AI 助手，有什么我可以帮助你的吗？",
        id: "welcome",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">扣子 AI 助手</h1>
            <p className="text-xs text-muted-foreground">
              {!clientReady ? "SDK加载中..." : "就绪"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* 消息区域 */}
      <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <Avatar
                className={cn(
                  "w-8 h-8 shrink-0",
                  message.role === "user"
                    ? "bg-gradient-to-br from-blue-500 to-blue-600"
                    : "bg-gradient-to-br from-purple-500 to-pink-600"
                )}
              >
                <AvatarFallback className="text-white text-xs">
                  {message.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                )}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 shrink-0 bg-gradient-to-br from-purple-500 to-pink-600">
                <AvatarFallback className="text-white">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">思考中...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 输入区域 */}
      <div className="border-t bg-card p-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end bg-background rounded-xl border p-2 focus-within:ring-2 focus-within:ring-ring focus-within:border-primary transition-all">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={!clientReady ? "SDK加载中..." : "输入消息... (Shift + Enter 换行)"}
              className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm py-2.5 px-3"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !clientReady}
              size="icon"
              className="shrink-0 h-10 w-10 rounded-lg"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            基于字节扣子 Chat SDK 构建
          </p>
        </div>
      </div>
    </div>
  );
}
