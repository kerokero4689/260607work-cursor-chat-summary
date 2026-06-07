export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: TagColor;
}

export type TagColor = "orange" | "blue" | "green" | "purple" | "gray";

export interface Chat {
  id: string;
  title: string;
  project?: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  tagIds: string[];
  note: string;
}

export interface ExportChatPayload {
  title: string;
  project?: string;
  tags: string[];
  note: string;
  messages: {
    role: MessageRole;
    content: string;
    createdAt: string;
  }[];
}
