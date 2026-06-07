import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { ExportChatPayload } from "@/types/chat";

const COLORS = {
  codeBg: "1E1E1E",
  codeText: "D4D4D4",
  accent: "007ACC",
  noteBg: "F0F7FF",
  noteBorder: "007ACC",
  tagBg: "E8F4FD",
  muted: "666666",
  heading: "1A1A2E",
};

interface ContentBlock {
  type: "text" | "code";
  content: string;
  language?: string;
}

function parseMarkdownContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index).trim();
      if (text) blocks.push({ type: "text", content: text });
    }
    blocks.push({
      type: "code",
      language: match[1] || "text",
      content: match[2].trimEnd(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const text = content.slice(lastIndex).trim();
    if (text) blocks.push({ type: "text", content: text });
  }

  return blocks.length > 0 ? blocks : [{ type: "text", content }];
}

function formatInlineMarkdown(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(
        new TextRun({ text: part.slice(2, -2), bold: true, size: 22 })
      );
    } else if (part.startsWith("`") && part.endsWith("`")) {
      runs.push(
        new TextRun({
          text: part.slice(1, -1),
          font: "Consolas",
          size: 20,
          color: "C7254E",
          shading: { type: ShadingType.CLEAR, fill: "F5F5F5" },
        })
      );
    } else {
      const lines = part.split("\n");
      lines.forEach((line, i) => {
        if (i > 0) runs.push(new TextRun({ break: 1 }));
        if (line.startsWith("### ")) {
          runs.push(
            new TextRun({ text: line.slice(4), bold: true, size: 24 })
          );
        } else if (line.startsWith("## ")) {
          runs.push(
            new TextRun({ text: line.slice(3), bold: true, size: 26 })
          );
        } else if (/^\d+\.\s/.test(line)) {
          runs.push(new TextRun({ text: line, size: 22 }));
        } else if (line.startsWith("- ")) {
          runs.push(new TextRun({ text: `• ${line.slice(2)}`, size: 22 }));
        } else {
          runs.push(new TextRun({ text: line, size: 22 }));
        }
      });
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text, size: 22 })];
}

function createCodeBlock(code: string, language: string): Table {
  const headerRow = new TableRow({
    children: [
      new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: "2D2D2D" },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "3C3C3C" },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.SINGLE, size: 1, color: "3C3C3C" },
          right: { style: BorderStyle.SINGLE, size: 1, color: "3C3C3C" },
        },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: language.toUpperCase(),
                font: "Consolas",
                size: 18,
                color: "858585",
                bold: true,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const codeLines = code.split("\n").map(
    (line) =>
      new Paragraph({
        spacing: { after: 0, before: 0 },
        children: [
          new TextRun({
            text: line || " ",
            font: "Consolas",
            size: 20,
            color: COLORS.codeText,
          }),
        ],
      })
  );

  const codeCell = new TableCell({
    width: { size: 100, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: COLORS.codeBg },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "3C3C3C" },
      left: { style: BorderStyle.SINGLE, size: 4, color: COLORS.accent },
      right: { style: BorderStyle.SINGLE, size: 1, color: "3C3C3C" },
    },
    children: codeLines,
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, new TableRow({ children: [codeCell] })],
  });
}

function createNoteBlock(note: string): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: COLORS.noteBg },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "D0E8FF" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "D0E8FF" },
              left: {
                style: BorderStyle.SINGLE,
                size: 12,
                color: COLORS.noteBorder,
              },
              right: { style: BorderStyle.SINGLE, size: 1, color: "D0E8FF" },
            },
            children: [
              new Paragraph({
                spacing: { before: 120, after: 80 },
                children: [
                  new TextRun({
                    text: "📝 Notes",
                    bold: true,
                    size: 22,
                    color: COLORS.accent,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { after: 120 },
                children: [
                  new TextRun({ text: note, size: 22, italics: true }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createMessageSection(
  role: "user" | "assistant",
  content: string,
  createdAt: string
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  const label = role === "user" ? "👤 User" : "🤖 Cursor AI";
  const labelColor = role === "user" ? "4A9EFF" : "10B981";

  elements.push(
    new Paragraph({
      spacing: { before: 300, after: 100 },
      children: [
        new TextRun({ text: label, bold: true, size: 24, color: labelColor }),
        new TextRun({
          text: `  ·  ${new Date(createdAt).toLocaleString("ja-JP")}`,
          size: 18,
          color: COLORS.muted,
        }),
      ],
    })
  );

  const blocks = parseMarkdownContent(content);
  for (const block of blocks) {
    if (block.type === "code") {
      elements.push(createCodeBlock(block.content, block.language ?? "code"));
      elements.push(new Paragraph({ spacing: { after: 100 } }));
    } else {
      elements.push(
        new Paragraph({
          spacing: { after: 120 },
          children: formatInlineMarkdown(block.content),
        })
      );
    }
  }

  return elements;
}

export async function generateWordDocument(
  payload: ExportChatPayload
): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: payload.title,
          bold: true,
          size: 36,
          color: COLORS.heading,
        }),
      ],
    })
  );

  // Metadata line
  const metaParts = [
    `Exported: ${new Date().toLocaleString("ja-JP")}`,
    payload.project ? `Project: ${payload.project}` : null,
    payload.tags.length > 0 ? `Tags: ${payload.tags.join(", ")}` : null,
  ].filter(Boolean);

  children.push(
    new Paragraph({
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: metaParts.join("  |  "),
          size: 20,
          color: COLORS.muted,
          italics: true,
        }),
      ],
    })
  );

  // Divider
  children.push(
    new Paragraph({
      spacing: { after: 300 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 2, color: COLORS.accent },
      },
    })
  );

  // Messages
  for (const message of payload.messages) {
    children.push(
      ...createMessageSection(message.role, message.content, message.createdAt)
    );
  }

  // Notes
  if (payload.note.trim()) {
    children.push(new Paragraph({ spacing: { before: 400 } }));
    children.push(
      new Paragraph({
        spacing: { after: 150 },
        children: [
          new TextRun({
            text: "Personal Notes",
            bold: true,
            size: 26,
            color: COLORS.heading,
          }),
        ],
      })
    );
    children.push(createNoteBlock(payload.note));
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return new Blob([new Uint8Array(buffer)], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
