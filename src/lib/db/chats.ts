import { prisma } from "@/lib/prisma";
import { DEFAULT_TAGS } from "@/lib/default-tags";
import {
  mapChat,
  mapTag,
  type ChatWithRelations,
} from "@/lib/db/mappers";
import type { MessageRole } from "@/types/chat";

const chatInclude = {
  messages: { orderBy: { createdAt: "asc" as const } },
  tags: { include: { tag: true } },
  note: true,
};

export async function ensureDefaultTags() {
  for (const tag of DEFAULT_TAGS) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: { color: tag.color },
      create: { name: tag.name, color: tag.color },
    });
  }
}

export async function listTags() {
  await ensureDefaultTags();
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  return tags.map(mapTag);
}

export async function listChats() {
  const chats = await prisma.chat.findMany({
    include: chatInclude,
    orderBy: { updatedAt: "desc" },
  });
  return chats.map((chat) => mapChat(chat as ChatWithRelations));
}

export async function getChat(id: string) {
  const chat = await prisma.chat.findUnique({
    where: { id },
    include: chatInclude,
  });
  return chat ? mapChat(chat as ChatWithRelations) : null;
}

export async function createChat(input: {
  title: string;
  project?: string;
  messages?: { role: MessageRole; content: string }[];
}) {
  const chat = await prisma.chat.create({
    data: {
      title: input.title,
      project: input.project,
      messages: {
        create:
          input.messages?.map((m) => ({
            role: m.role,
            content: m.content,
          })) ?? [],
      },
      note: { create: { content: "" } },
    },
    include: chatInclude,
  });
  return mapChat(chat as ChatWithRelations);
}

export async function importChat(input: {
  title: string;
  project?: string;
  messages: { role: MessageRole; content: string }[];
}) {
  return createChat(input);
}

export async function updateChatNote(chatId: string, content: string) {
  const chat = await prisma.chat.update({
    where: { id: chatId },
    data: {
      note: {
        upsert: {
          create: { content },
          update: { content },
        },
      },
    },
    include: chatInclude,
  });
  return mapChat(chat as ChatWithRelations);
}

export async function toggleChatTag(chatId: string, tagId: string) {
  const existing = await prisma.chatTag.findUnique({
    where: { chatId_tagId: { chatId, tagId } },
  });

  if (existing) {
    await prisma.chatTag.delete({
      where: { chatId_tagId: { chatId, tagId } },
    });
  } else {
    await prisma.chatTag.create({
      data: { chatId, tagId },
    });
  }

  const chat = await prisma.chat.findUniqueOrThrow({
    where: { id: chatId },
    include: chatInclude,
  });
  return mapChat(chat as ChatWithRelations);
}

export async function createCustomTag(name: string) {
  const tag = await prisma.tag.create({
    data: { name, color: "gray" },
  });
  return mapTag(tag);
}

export async function deleteChat(id: string) {
  await prisma.chat.delete({ where: { id } });
}
