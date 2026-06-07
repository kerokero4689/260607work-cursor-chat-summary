"use client";

import { useCallback, useState } from "react";
import { saveAs } from "file-saver";
import { ActivityBar } from "./ActivityBar";
import { ChatThreadPane } from "./ChatThreadPane";
import { MessagePane } from "./MessagePane";
import { MetadataPane } from "./MetadataPane";
import { AVAILABLE_TAGS, MOCK_CHATS } from "@/lib/mock-data";
import type { Chat } from "@/types/chat";

export function ChatArchiveApp() {
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [selectedChatId, setSelectedChatId] = useState(MOCK_CHATS[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedChat = chats.find((c) => c.id === selectedChatId) ?? chats[0];

  const updateChat = useCallback(
    (updater: (chat: Chat) => Chat) => {
      setChats((prev) =>
        prev.map((c) => (c.id === selectedChatId ? updater(c) : c))
      );
    },
    [selectedChatId]
  );

  const handleToggleTag = (tagId: string) => {
    updateChat((chat) => {
      const hasTag = chat.tagIds.includes(tagId);
      return {
        ...chat,
        tagIds: hasTag
          ? chat.tagIds.filter((id) => id !== tagId)
          : [...chat.tagIds, tagId],
      };
    });
  };

  const handleNoteChange = (note: string) => {
    updateChat((chat) => ({ ...chat, note }));
  };

  const handleExport = async () => {
    const tagNames = selectedChat.tagIds
      .map((id) => AVAILABLE_TAGS.find((t) => t.id === id)?.name)
      .filter(Boolean) as string[];

    const response = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: selectedChat.title,
        project: selectedChat.project,
        tags: tagNames,
        note: selectedChat.note,
        messages: selectedChat.messages.map((m) => ({
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error("Export failed");
    }

    const blob = await response.blob();
    const filename = `${selectedChat.title.replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF-]/g, "_")}.docx`;
    saveAs(blob, filename);
  };

  const handleNewChat = () => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: "新しいチャット",
      project: "e-commerce-app-v2",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tagIds: [],
      note: "",
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: "user",
          content: "新しいチャットを開始しました。",
          createdAt: new Date().toISOString(),
        },
      ],
    };
    setChats((prev) => [newChat, ...prev]);
    setSelectedChatId(newChat.id);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <ActivityBar />
      <ChatThreadPane
        chats={chats}
        tags={AVAILABLE_TAGS}
        selectedChatId={selectedChatId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectChat={setSelectedChatId}
        onNewChat={handleNewChat}
      />
      <MessagePane
        title={selectedChat.title}
        messages={selectedChat.messages}
      />
      <MetadataPane
        tags={AVAILABLE_TAGS}
        selectedTagIds={selectedChat.tagIds}
        project={selectedChat.project ?? ""}
        note={selectedChat.note}
        onToggleTag={handleToggleTag}
        onNoteChange={handleNoteChange}
        onExport={handleExport}
      />
    </div>
  );
}
