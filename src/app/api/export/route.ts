import { NextRequest, NextResponse } from "next/server";
import { generateWordDocument } from "@/lib/export-word";
import type { ExportChatPayload } from "@/types/chat";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ExportChatPayload;

    if (!payload.title || !payload.messages?.length) {
      return NextResponse.json(
        { error: "title and messages are required" },
        { status: 400 }
      );
    }

    const blob = await generateWordDocument(payload);
    const buffer = Buffer.from(await blob.arrayBuffer());
    const filename = `${payload.title.replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF-]/g, "_")}.docx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error("Word export failed:", error);
    return NextResponse.json(
      { error: "Failed to generate Word document" },
      { status: 500 }
    );
  }
}
