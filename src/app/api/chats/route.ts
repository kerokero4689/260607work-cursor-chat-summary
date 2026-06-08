import { NextRequest, NextResponse } from "next/server";
import { createChat, listChats } from "@/lib/db/chats";

export async function GET() {
  try {
    const chats = await listChats();
    return NextResponse.json(chats);
  } catch (error) {
    console.error("GET /api/chats failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const chat = await createChat({
      title: body.title ?? "新しいチャット",
      project: body.project,
      messages: body.messages ?? [
        {
          role: "user",
          content: body.initialMessage ?? "新しいチャットを開始しました。",
        },
      ],
    });
    return NextResponse.json(chat, { status: 201 });
  } catch (error) {
    console.error("POST /api/chats failed:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}
