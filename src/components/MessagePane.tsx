"use client";

import { Bot, MoreHorizontal, User } from "lucide-react";
import type { Message } from "@/types/chat";
import { MarkdownContent } from "./MarkdownContent";

interface MessagePaneProps {
  title: string;
  messages: Message[];
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessagePane({ title, messages }: MessagePaneProps) {
  return (
    <main className="flex w-[50%] min-w-0 flex-col bg-[var(--bg-primary)]">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            AI Response
          </p>
          <h2 className="truncate text-sm font-semibold text-[var(--text-primary)]">
            {title}
          </h2>
        </div>
        <button
          type="button"
          className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
        >
          <MoreHorizontal size={18} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={`mb-6 rounded-lg border p-4 ${
                isUser
                  ? "border-[#1f3a5f] bg-[#0d1f33]"
                  : "border-[var(--border)] bg-[var(--bg-secondary)]"
              }`}
            >
              <div className="mb-3 flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    isUser ? "bg-[#1f6feb]/20" : "bg-[#238636]/20"
                  }`}
                >
                  {isUser ? (
                    <User size={14} className="text-[#4a9eff]" />
                  ) : (
                    <Bot size={14} className="text-[#3fb950]" />
                  )}
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {isUser ? "User" : "Cursor"}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {formatTime(message.createdAt)}
                </span>
              </div>
              <div className="text-sm">
                {isUser ? (
                  <p className="leading-relaxed text-[var(--text-primary)]">
                    {message.content}
                  </p>
                ) : (
                  <MarkdownContent content={message.content} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
