"use client";

import { Import, Plus, Search } from "lucide-react";
import type { Chat, Tag } from "@/types/chat";
import { TagBadge } from "./TagBadge";

interface ChatThreadPaneProps {
  chats: Chat[];
  tags: Tag[];
  selectedChatId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onImport: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;
  return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

export function ChatThreadPane({
  chats,
  tags,
  selectedChatId,
  searchQuery,
  onSearchChange,
  onSelectChat,
  onNewChat,
  onImport,
}: ChatThreadPaneProps) {
  const tagMap = Object.fromEntries(tags.map((t) => [t.id, t]));

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      chat.title.toLowerCase().includes(q) ||
      chat.messages.some((m) => m.content.toLowerCase().includes(q)) ||
      chat.tagIds.some((id) => tagMap[id]?.name.toLowerCase().includes(q))
    );
  });

  return (
    <aside className="flex w-[25%] min-w-[220px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="border-b border-[var(--border)] p-3">
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={onNewChat}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            <Plus size={16} />
            New Chat
          </button>
          <button
            type="button"
            onClick={onImport}
            title="Import"
            className="flex items-center justify-center rounded-md border border-[var(--border)] px-3 py-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)]"
          >
            <Import size={16} />
          </button>
        </div>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-primary)] py-1.5 pl-8 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <p className="p-4 text-center text-sm text-[var(--text-muted)]">
            チャットが見つかりません
          </p>
        ) : (
          filteredChats.map((chat) => {
            const isSelected = chat.id === selectedChatId;
            const preview = chat.messages[0]?.content.slice(0, 80) ?? "";

            return (
              <button
                key={chat.id}
                type="button"
                onClick={() => onSelectChat(chat.id)}
                className={`w-full border-b border-[var(--border)] p-3 text-left transition-colors ${
                  isSelected
                    ? "border-l-2 border-l-[var(--accent)] bg-[var(--bg-hover)]"
                    : "border-l-2 border-l-transparent hover:bg-[var(--bg-hover)]"
                }`}
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-sm font-medium leading-snug text-[var(--text-primary)]">
                    {chat.title}
                  </h3>
                  <span className="shrink-0 text-[10px] text-[var(--text-muted)]">
                    {formatDate(chat.updatedAt)}
                  </span>
                </div>
                <p className="mb-2 line-clamp-2 text-xs text-[var(--text-secondary)]">
                  {preview}
                </p>
                {chat.tagIds.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {chat.tagIds.map((tagId) => {
                      const tag = tagMap[tagId];
                      if (!tag) return null;
                      return (
                        <TagBadge
                          key={tagId}
                          name={tag.name}
                          color={tag.color}
                          size="sm"
                        />
                      );
                    })}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
