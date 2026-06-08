import { NextRequest, NextResponse } from "next/server";
import { deleteChat, getChat } from "@/lib/db/chats";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chat = await getChat(id);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    return NextResponse.json(chat);
  } catch (error) {
    console.error("GET /api/chats/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteChat(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/chats/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
}
