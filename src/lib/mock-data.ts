import type { Chat, Tag } from "@/types/chat";

export const AVAILABLE_TAGS: Tag[] = [
  { id: "tag-important", name: "Important", color: "orange" },
  { id: "tag-bugfix", name: "Bug Fix", color: "blue" },
  { id: "tag-optimization", name: "Optimization", color: "blue" },
  { id: "tag-refactoring", name: "Refactoring", color: "blue" },
  { id: "tag-react", name: "React", color: "green" },
  { id: "tag-python", name: "Python", color: "green" },
];

const PANDAS_CODE = `\`\`\`python
import pandas as pd

def process_large_csv(file_path: str, chunk_size: int = 10000):
    """大規模CSVをチャンク単位で処理する"""
    results = []
    for chunk in pd.read_csv(file_path, chunksize=chunk_size):
        chunk["total"] = chunk["price"] * chunk["quantity"]
        filtered = chunk[chunk["total"] > 1000]
        results.append(filtered.groupby("category")["total"].sum())
    return pd.concat(results).groupby(level=0).sum()
\`\`\``;

const ASSISTANT_RESPONSE = `大規模なCSVファイルを扱う場合、Pandasのチャンク読み込み（\`chunksize\`）を使うのが最適です。メモリに全データを載せず、分割処理できます。

${PANDAS_CODE}

### 実装のポイント

1. **チャンクサイズ**: 10,000行程度から始め、メモリ使用量を見ながら調整
2. **集計の統合**: 各チャンクの結果を \`pd.concat\` で結合し、最終的に \`groupby\` で再集計
3. **エラーハンドリング**: 破損行のスキップや型変換エラーのログ出力を追加

このアプローチなら、数GBのファイルでも安定して処理できます。`;

export const MOCK_CHATS: Chat[] = [
  {
    id: "chat-1",
    title: "データ処理用Pythonスクリプト開発",
    project: "e-commerce-app-v2",
    createdAt: "2026-06-05T10:30:00.000Z",
    updatedAt: "2026-06-05T11:15:00.000Z",
    tagIds: ["tag-important", "tag-python", "tag-optimization"],
    note: "本番環境では chunk_size を 5000 に下げる。S3 からのストリーミング読み込みも検討する。",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content:
          "大規模なCSVファイル（数GB）を効率的に処理するPythonスクリプトを書きたいです。Pandasを使ったチャンク処理のベストプラクティスを教えてください。",
        createdAt: "2026-06-05T10:30:00.000Z",
      },
      {
        id: "msg-2",
        role: "assistant",
        content: ASSISTANT_RESPONSE,
        createdAt: "2026-06-05T10:32:00.000Z",
      },
      {
        id: "msg-3",
        role: "user",
        content: "メモリ使用量をモニタリングする方法も追加できますか？",
        createdAt: "2026-06-05T11:00:00.000Z",
      },
      {
        id: "msg-4",
        role: "assistant",
        content: `もちろんです。\`psutil\` を使えば処理中のメモリ使用量をログに記録できます。

\`\`\`python
import psutil

def log_memory(label: str):
    mem = psutil.Process().memory_info().rss / 1024 / 1024
    print(f"[{label}] Memory: {mem:.1f} MB")
\`\`\`

各チャンク処理の前後で \`log_memory()\` を呼ぶと、メモリリークの早期発見に役立ちます。`,
        createdAt: "2026-06-05T11:02:00.000Z",
      },
    ],
  },
  {
    id: "chat-2",
    title: "React コンポーネントのリファクタリング",
    project: "e-commerce-app-v2",
    createdAt: "2026-06-04T14:00:00.000Z",
    updatedAt: "2026-06-04T15:30:00.000Z",
    tagIds: ["tag-refactoring", "tag-react"],
    note: "カート画面の useCart フックを Context から Zustand に移行予定。",
    messages: [
      {
        id: "msg-5",
        role: "user",
        content:
          "ProductCard コンポーネントが肥大化しています。責務を分離するリファクタリング案をください。",
        createdAt: "2026-06-04T14:00:00.000Z",
      },
      {
        id: "msg-6",
        role: "assistant",
        content: `以下の3層に分割することをおすすめします。

1. **ProductCard** — レイアウトとデータ受け渡しのみ
2. **ProductImage** — 画像表示・遅延読み込み
3. **ProductActions** — カート追加・お気に入りボタン

\`\`\`tsx
export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="rounded-lg border p-4">
      <ProductImage src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <ProductActions productId={product.id} />
    </article>
  );
}
\`\`\``,
        createdAt: "2026-06-04T14:05:00.000Z",
      },
    ],
  },
  {
    id: "chat-3",
    title: "API エンドポイントのバグ修正",
    project: "e-commerce-app-v2",
    createdAt: "2026-06-03T09:00:00.000Z",
    updatedAt: "2026-06-03T09:45:00.000Z",
    tagIds: ["tag-bugfix"],
    note: "",
    messages: [
      {
        id: "msg-7",
        role: "user",
        content: "/api/orders の POST で 500 エラーが発生します。リクエストボディのバリデーション周りを確認したいです。",
        createdAt: "2026-06-03T09:00:00.000Z",
      },
      {
        id: "msg-8",
        role: "assistant",
        content: `原因は \`items\` 配列が空のときに \`reduce\` が例外を投げている可能性が高いです。ガード節を追加してください。

\`\`\`typescript
if (!body.items || body.items.length === 0) {
  return NextResponse.json(
    { error: "items must not be empty" },
    { status: 400 }
  );
}
\`\`\``,
        createdAt: "2026-06-03T09:10:00.000Z",
      },
    ],
  },
];
