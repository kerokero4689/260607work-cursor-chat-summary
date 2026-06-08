import { NextRequest, NextResponse } from "next/server";
import { parseCursorExport } from "@/lib/cursor-import";
import { importChat } from "@/lib/db/chats";

export async function POST(request: NextRequest) {
  try {
    const { raw, title, project } = await request.json();

    if (!raw?.trim()) {
      return NextResponse.json(
        { error: "raw import data is required" },
        { status: 400 }
      );
    }

    const parsed = parseCursorExport(raw);
    const chat = await importChat({
      title: title?.trim() || parsed.title,
      project: project?.trim() || undefined,
      messages: parsed.messages,
    });

    return NextResponse.json(chat, { status: 201 });
  } catch (error) {
    console.error("POST /api/import failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to import chat";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
