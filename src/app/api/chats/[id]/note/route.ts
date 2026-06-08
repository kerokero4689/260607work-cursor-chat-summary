import { NextRequest, NextResponse } from "next/server";
import { updateChatNote } from "@/lib/db/chats";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { content } = await request.json();
    const chat = await updateChatNote(id, String(content ?? ""));
    return NextResponse.json(chat);
  } catch (error) {
    console.error("PUT /api/chats/[id]/note failed:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}
