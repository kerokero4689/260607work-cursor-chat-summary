import type { Chat, Tag } from "@/types/chat";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  getChats: () => request<Chat[]>("/api/chats"),
  createChat: (data?: { title?: string; project?: string }) =>
    request<Chat>("/api/chats", {
      method: "POST",
      body: JSON.stringify(data ?? {}),
    }),
  updateNote: (chatId: string, content: string) =>
    request<Chat>(`/api/chats/${chatId}/note`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    }),
  toggleTag: (chatId: string, tagId: string) =>
    request<Chat>(`/api/chats/${chatId}/tags`, {
      method: "PUT",
      body: JSON.stringify({ tagId }),
    }),
  createTag: (name: string) =>
    request<Tag>("/api/tags", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  getTags: () => request<Tag[]>("/api/tags"),
  importChat: (raw: string, title?: string, project?: string) =>
    request<Chat>("/api/import", {
      method: "POST",
      body: JSON.stringify({ raw, title, project }),
    }),
  seed: () => request<{ message: string }>("/api/seed", { method: "POST" }),
};
