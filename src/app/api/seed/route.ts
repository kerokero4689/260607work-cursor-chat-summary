import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDefaultTags } from "@/lib/db/chats";

const SAMPLE_MESSAGES = [
  {
    role: "user" as const,
    content:
      "大規模なCSVファイル（数GB）を効率的に処理するPythonスクリプトを書きたいです。Pandasを使ったチャンク処理のベストプラクティスを教えてください。",
  },
  {
    role: "assistant" as const,
    content: `大規模なCSVファイルを扱う場合、Pandasのチャンク読み込み（\`chunksize\`）を使うのが最適です。

\`\`\`python
import pandas as pd

def process_large_csv(file_path: str, chunk_size: int = 10000):
    for chunk in pd.read_csv(file_path, chunksize=chunk_size):
        chunk["total"] = chunk["price"] * chunk["quantity"]
        yield chunk[chunk["total"] > 1000]
\`\`\`

チャンクサイズは 10,000 行程度から始め、メモリ使用量を見ながら調整してください。`,
  },
];

export async function POST() {
  try {
    await ensureDefaultTags();

    const count = await prisma.chat.count();
    if (count > 0) {
      return NextResponse.json({ message: "Already seeded", skipped: true });
    }

    const importantTag = await prisma.tag.findUnique({
      where: { name: "Important" },
    });
    const pythonTag = await prisma.tag.findUnique({
      where: { name: "Python" },
    });

    const chat = await prisma.chat.create({
      data: {
        title: "データ処理用Pythonスクリプト開発",
        project: "e-commerce-app-v2",
        messages: { create: SAMPLE_MESSAGES },
        note: {
          create: {
            content:
              "本番環境では chunk_size を 5000 に下げる。S3 からのストリーミング読み込みも検討する。",
          },
        },
        tags: {
          create: [
            ...(importantTag ? [{ tagId: importantTag.id }] : []),
            ...(pythonTag ? [{ tagId: pythonTag.id }] : []),
          ],
        },
      },
    });

    return NextResponse.json({
      message: "Seed completed",
      chatId: chat.id,
    });
  } catch (error) {
    console.error("POST /api/seed failed:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
