import type { Chat, Message, Tag, TagColor } from "@/types/chat";
import type {
  Chat as PrismaChat,
  Message as PrismaMessage,
  Note,
  Tag as PrismaTag,
} from "@prisma/client";

type ChatTagWithTag = { tagId: string; tag: PrismaTag };

export type ChatWithRelations = PrismaChat & {
  messages: PrismaMessage[];
  tags: ChatTagWithTag[];
  note: Note | null;
};

const VALID_COLORS: TagColor[] = ["orange", "blue", "green", "purple", "gray"];

function toTagColor(color: string): TagColor {
  return VALID_COLORS.includes(color as TagColor) ? (color as TagColor) : "blue";
}

export function mapTag(tag: PrismaTag): Tag {
  return {
    id: tag.id,
    name: tag.name,
    color: toTagColor(tag.color),
  };
}

export function mapMessage(message: PrismaMessage): Message {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };
}

export function mapChat(chat: ChatWithRelations): Chat {
  return {
    id: chat.id,
    title: chat.title,
    project: chat.project ?? undefined,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
    messages: chat.messages.map(mapMessage),
    tagIds: chat.tags.map((ct) => ct.tagId),
    note: chat.note?.content ?? "",
  };
}
