import type { MessageRole } from "@/types/chat";

export interface ParsedImport {
  title: string;
  messages: { role: MessageRole; content: string }[];
}

interface ContentBlock {
  type?: string;
  text?: string;
}

function extractUserQuery(text: string): string {
  const match = text.match(/<user_query>\s*([\s\S]*?)\s*<\/user_query>/i);
  if (match) return match[1].trim();
  return text
    .replace(/\[Image\][\s\S]*?<\/image_files>/gi, "")
    .replace(/<image_files>[\s\S]*?<\/image_files>/gi, "")
    .trim();
}

function extractTextFromContent(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";

  return content
    .filter((block: ContentBlock) => block?.type === "text" && block.text)
    .map((block: ContentBlock) => block.text!.trim())
    .filter(Boolean)
    .join("\n\n");
}

function normalizeRole(raw: string): MessageRole | null {
  const role = raw.toLowerCase();
  if (role === "user" || role === "human") return "user";
  if (role === "assistant" || role === "ai" || role === "cursor" || role === "bot") {
    return "assistant";
  }
  return null;
}

function parseMessageEntry(entry: Record<string, unknown>): {
  role: MessageRole;
  content: string;
} | null {
  const role = normalizeRole(String(entry.role ?? entry.type ?? ""));
  if (!role) return null;

  let content = "";

  if (typeof entry.content === "string") {
    content = entry.content;
  } else if (entry.message && typeof entry.message === "object") {
    const msg = entry.message as Record<string, unknown>;
    content = extractTextFromContent(msg.content ?? msg.text);
  } else if (entry.text) {
    content = String(entry.text);
  } else {
    content = extractTextFromContent(entry.content);
  }

  content = content.trim();
  if (!content) return null;

  if (role === "user") {
    content = extractUserQuery(content);
  }

  if (!content) return null;
  return { role, content };
}

function mergeConsecutiveMessages(
  messages: { role: MessageRole; content: string }[]
) {
  const merged: { role: MessageRole; content: string }[] = [];

  for (const msg of messages) {
    const last = merged[merged.length - 1];
    if (last && last.role === msg.role) {
      last.content = `${last.content}\n\n${msg.content}`;
    } else {
      merged.push({ ...msg });
    }
  }

  return merged;
}

function deriveTitle(messages: { role: MessageRole; content: string }[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "Imported Chat";
  const line = firstUser.content.split("\n")[0].trim();
  return line.length > 60 ? `${line.slice(0, 60)}…` : line;
}

function parseJsonl(raw: string): ParsedImport {
  const messages: { role: MessageRole; content: string }[] = [];

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const entry = JSON.parse(trimmed) as Record<string, unknown>;
      const parsed = parseMessageEntry(entry);
      if (parsed) messages.push(parsed);
    } catch {
      // skip invalid lines
    }
  }

  const merged = mergeConsecutiveMessages(messages);
  return { title: deriveTitle(merged), messages: merged };
}

function parseJsonObject(data: Record<string, unknown>): ParsedImport {
  const rawMessages =
    (data.messages as unknown[]) ??
    (data.conversation as unknown[]) ??
    (data.chats as unknown[]) ??
    [];

  const messages: { role: MessageRole; content: string }[] = [];

  for (const item of rawMessages) {
    if (!item || typeof item !== "object") continue;
    const parsed = parseMessageEntry(item as Record<string, unknown>);
    if (parsed) messages.push(parsed);
  }

  const merged = mergeConsecutiveMessages(messages);
  const title =
    typeof data.title === "string" && data.title.trim()
      ? data.title.trim()
      : deriveTitle(merged);

  return { title, messages: merged };
}

export function parseCursorExport(raw: string): ParsedImport {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("インポートデータが空です");
  }

  // JSONL (Cursor agent transcripts)
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) {
    const result = parseJsonl(trimmed);
    if (result.messages.length === 0) {
      throw new Error("有効なメッセージが見つかりませんでした");
    }
    return result;
  }

  let data: unknown;
  try {
    data = JSON.parse(trimmed);
  } catch {
    const result = parseJsonl(trimmed);
    if (result.messages.length === 0) {
      throw new Error("JSONの解析に失敗しました");
    }
    return result;
  }

  if (Array.isArray(data)) {
    const messages: { role: MessageRole; content: string }[] = [];
    for (const item of data) {
      if (!item || typeof item !== "object") continue;
      const parsed = parseMessageEntry(item as Record<string, unknown>);
      if (parsed) messages.push(parsed);
    }
    const merged = mergeConsecutiveMessages(messages);
    return { title: deriveTitle(merged), messages: merged };
  }

  if (typeof data === "object" && data !== null) {
    const result = parseJsonObject(data as Record<string, unknown>);
    if (result.messages.length === 0) {
      throw new Error("有効なメッセージが見つかりませんでした");
    }
    return result;
  }

  throw new Error("サポートされていない形式です");
}
