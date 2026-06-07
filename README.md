# Cursor Chat Archive

Cursorのチャット履歴を整理・保存するためのWebアプリケーション（プロトタイプ）。

## 技術スタック

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS 4**
- **Prisma** + **Neon (Postgres)**
- **docx** — Word (.docx) エクスポート

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定（DB接続時）

```bash
cp .env.example .env
```

`.env` に Neon の接続文字列を設定:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

### 3. Prisma のセットアップ（DB接続時）

```bash
npm run db:generate
npm run db:push
```

> プロトタイプ段階ではモックデータで動作するため、DB接続なしでも UI と Word エクスポートは利用可能です。

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 を開いてください。

## 画面構成

| ペイン | 幅 | 機能 |
|--------|-----|------|
| Activity Bar | 48px | VS Code風ナビゲーション |
| 左 | 25% | チャット一覧・検索・New Chat |
| 中央 | 50% | メッセージ表示・コードハイライト |
| 右 | 25% | タグ・メモ・Wordエクスポート |

## データベーススキーマ

`prisma/schema.prisma` に定義:

- `chats` — チャットスレッド
- `messages` — ユーザー/AIメッセージ
- `tags` — タグマスタ
- `chat_tags` — チャット↔タグ（多対多）
- `notes` — チャットごとのメモ

## Word エクスポート

右ペインの「Save to Word」ボタンで、以下を含む `.docx` をダウンロード:

- タイトル・プロジェクト・タグ・日時
- ユーザー/AIメッセージ（コードブロックは暗背景 + 左アクセントライン）
- Notes（左アクセント枠線 + 薄青背景）

実装: `src/lib/export-word.ts` + `src/app/api/export/route.ts`

## プロジェクト構成

```
src/
├── app/
│   ├── api/export/route.ts   # Wordエクスポート API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ActivityBar.tsx
│   ├── ChatArchiveApp.tsx    # メインアプリ（状態管理）
│   ├── ChatThreadPane.tsx
│   ├── CodeBlock.tsx
│   ├── MarkdownContent.tsx
│   ├── MessagePane.tsx
│   ├── MetadataPane.tsx
│   └── TagBadge.tsx
├── lib/
│   ├── export-word.ts        # docx 生成ロジック
│   ├── mock-data.ts          # ダミーデータ
│   └── prisma.ts
└── types/
    └── chat.ts
```
