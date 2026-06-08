"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { ActivityBar } from "./ActivityBar";
import { ChatThreadPane } from "./ChatThreadPane";
import { ImportModal } from "./ImportModal";
import { MessagePane } from "./MessagePane";
import { MetadataPane } from "./MetadataPane";
import { api } from "@/lib/api-client";
import type { Chat, Tag } from "@/types/chat";

export function ChatArchiveApp() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noteSaveState, setNoteSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [importOpen, setImportOpen] = useState(false);
  const noteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedChat = chats.find((c) => c.id === selectedChatId);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await api.seed();
      const [chatList, tagList] = await Promise.all([
        api.getChats(),
        api.getTags(),
      ]);
      setChats(chatList);
      setTags(tagList);
      setSelectedChatId((prev) => {
        if (prev && chatList.some((c) => c.id === prev)) return prev;
        return chatList[0]?.id ?? "";
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "データの読み込みに失敗しました";
      setError(
        msg.includes("DATABASE_URL")
          ? msg
          : `${msg}\n\nプロジェクトルートの .env に DATABASE_URL を設定し、npm run db:push を実行してください。`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateSelectedChat = useCallback((chat: Chat) => {
    setChats((prev) => prev.map((c) => (c.id === chat.id ? chat : c)));
  }, []);

  const handleToggleTag = async (tagId: string) => {
    if (!selectedChat) return;
    try {
      const updated = await api.toggleTag(selectedChat.id, tagId);
      updateSelectedChat(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "タグの保存に失敗しました");
    }
  };

  const handleNoteChange = (note: string) => {
    if (!selectedChat) return;

    setChats((prev) =>
      prev.map((c) => (c.id === selectedChat.id ? { ...c, note } : c))
    );

    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    setNoteSaveState("saving");

    noteTimerRef.current = setTimeout(async () => {
      try {
        const updated = await api.updateNote(selectedChat.id, note);
        updateSelectedChat(updated);
        setNoteSaveState("saved");
        setTimeout(() => setNoteSaveState("idle"), 1500);
      } catch (e) {
        setNoteSaveState("idle");
        setError(e instanceof Error ? e.message : "メモの保存に失敗しました");
      }
    }, 800);
  };

  const handleExport = async () => {
    if (!selectedChat) return;

    const tagNames = selectedChat.tagIds
      .map((id) => tags.find((t) => t.id === id)?.name)
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

    if (!response.ok) throw new Error("Export failed");

    const blob = await response.blob();
    const filename = `${selectedChat.title.replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF-]/g, "_")}.docx`;
    saveAs(blob, filename);
  };

  const handleNewChat = async () => {
    try {
      const chat = await api.createChat({ title: "新しいチャット" });
      setChats((prev) => [chat, ...prev]);
      setSelectedChatId(chat.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "チャットの作成に失敗しました");
    }
  };

  const handleImport = async (raw: string, title?: string) => {
    const chat = await api.importChat(raw, title);
    setChats((prev) => [chat, ...prev]);
    setSelectedChatId(chat.id);
  };

  const handleAddTag = async (name: string) => {
    try {
      const tag = await api.createTag(name);
      setTags((prev) => [...prev, tag]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "タグの作成に失敗しました");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)] text-[var(--text-secondary)]">
        読み込み中…
      </div>
    );
  }

  if (error && chats.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-primary)] p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button
          type="button"
          onClick={loadData}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm text-white"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <ActivityBar />
        <ChatThreadPane
          chats={chats}
          tags={tags}
          selectedChatId={selectedChatId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectChat={setSelectedChatId}
          onNewChat={handleNewChat}
          onImport={() => setImportOpen(true)}
        />
        {selectedChat ? (
          <>
            <MessagePane
              title={selectedChat.title}
              messages={selectedChat.messages}
            />
            <MetadataPane
              tags={tags}
              selectedTagIds={selectedChat.tagIds}
              project={selectedChat.project ?? ""}
              note={selectedChat.note}
              noteSaveState={noteSaveState}
              onToggleTag={handleToggleTag}
              onNoteChange={handleNoteChange}
              onAddTag={handleAddTag}
              onExport={handleExport}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-[var(--text-muted)]">
            チャットを選択するか、インポートしてください
          </div>
        )}
      </div>
      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />
    </>
  );
}
