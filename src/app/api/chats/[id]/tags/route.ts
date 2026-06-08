import { NextRequest, NextResponse } from "next/server";
import { toggleChatTag } from "@/lib/db/chats";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tagId } = await request.json();
    if (!tagId) {
      return NextResponse.json({ error: "tagId is required" }, { status: 400 });
    }
    const chat = await toggleChatTag(id, tagId);
    return NextResponse.json(chat);
  } catch (error) {
    console.error("PUT /api/chats/[id]/tags failed:", error);
    return NextResponse.json(
      { error: "Failed to toggle tag" },
      { status: 500 }
    );
  }
}
