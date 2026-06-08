import { NextRequest, NextResponse } from "next/server";
import { createCustomTag, listTags } from "@/lib/db/chats";

export async function GET() {
  try {
    const tags = await listTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error("GET /api/tags failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const tag = await createCustomTag(name.trim());
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("POST /api/tags failed:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
