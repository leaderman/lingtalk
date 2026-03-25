"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { CozeAPI, ChatEventType, RoleType } from "@coze/api";
import { Send, User, Bot, Loader2, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

interface ChatConfig {
  token: string;
  botId: string;
  baseURL?: string;
}

export function ChatSDKInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "你好！我是扣子 AI 助手，请在设置中配置 Token 和 Bot ID 开始对话。",
      id: "welcome",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<ChatConfig>({
    token: "",
    botId: "",
    baseURL: "https://api.coze.cn",
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const clientRef = useRef<CozeAPI | null>(null);

  // 初始化 Coze 客户端
  useEffect(() => {
    if (config.token && config.botId) {
      clientRef.current = new CozeAPI({
        token: config.token,
        baseURL: config.baseURL,
        allowPersonalAccessTokenInBrowser: true,
      });
      setIsConfigured(true);
    }
  }, [config]);

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

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !isConfigured || !clientRef.current) {
      if (!isConfigured) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "请先点击右上角设置按钮，配置你的 Token 和 Bot ID。",
            id: Date.now().toString(),
          },
        ]);
      }
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
      const stream = await clientRef.current.chat.stream({
        bot_id: config.botId,
        auto_save_history: true,
        additional_messages: [
          {
            role: RoleType.User,
            content: userMessage.content,
            content_type: "text",
          },
        ],
      });

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

      for await (const part of stream) {
        if (part.event === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
          const delta = part.data;
          if (delta.content) {
            assistantContent += delta.content;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: assistantContent } : m
              )
            );
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `出错啦: ${error instanceof Error ? error.message : "未知错误"}。请检查你的 Token 和 Bot ID 是否正确。`,
          id: (Date.now() + 1).toString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isConfigured, config.botId]);

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
        content: isConfigured
          ? "你好！我是扣子 AI 助手，有什么我可以帮助你的吗？"
          : "你好！我是扣子 AI 助手，请在设置中配置 Token 和 Bot ID 开始对话。",
        id: "welcome",
      },
    ]);
  };

  const handleSaveConfig = (newConfig: ChatConfig) => {
    setConfig(newConfig);
    setMessages([
      {
        role: "assistant",
        content: "配置已保存！现在可以开始对话了。",
        id: "configured",
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
              {isConfigured ? "已配置" : "未配置"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>配置 Chat SDK</DialogTitle>
                <DialogDescription>
                  请输入你的扣子 Token 和 Bot ID。这些信息仅存储在浏览器本地。
                </DialogDescription>
              </DialogHeader>
              <ConfigForm config={config} onSave={handleSaveConfig} />
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
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
              placeholder={
                isConfigured
                  ? "输入消息... (Shift + Enter 换行)"
                  : "请先配置 Token 和 Bot ID"
              }
              className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm py-2.5 px-3"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
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

// 配置表单组件
function ConfigForm({
  config,
  onSave,
}: {
  config: ChatConfig;
  onSave: (config: ChatConfig) => void;
}) {
  const [localConfig, setLocalConfig] = useState(config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localConfig);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="token">
          Token
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="token"
          type="password"
          placeholder="输入你的扣子 Personal Access Token"
          value={localConfig.token}
          onChange={(e) =>
            setLocalConfig((prev) => ({ ...prev, token: e.target.value }))
          }
          required
        />
        <p className="text-xs text-muted-foreground">
          在扣子平台的「设置 &gt; 个人访问令牌」中获取
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="botId">
          Bot ID
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="botId"
          placeholder="输入你的 Bot ID"
          value={localConfig.botId}
          onChange={(e) =>
            setLocalConfig((prev) => ({ ...prev, botId: e.target.value }))
          }
          required
        />
        <p className="text-xs text-muted-foreground">
          在扣子平台的「发布 &gt; Web SDK」中获取 Bot ID
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="baseURL">Base URL（可选）</Label>
        <Input
          id="baseURL"
          placeholder="https://api.coze.cn"
          value={localConfig.baseURL}
          onChange={(e) =>
            setLocalConfig((prev) => ({ ...prev, baseURL: e.target.value }))
          }
        />
      </div>
      <Button type="submit" className="w-full">
        保存配置
      </Button>
    </form>
  );
}
