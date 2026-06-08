import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const root = resolve(process.cwd());
const envPath = resolve(root, ".env");

console.log("\n📁 Cursor Chat Archive - 環境チェック\n");

if (!existsSync(envPath)) {
  console.error("❌ .env ファイルがありません。");
  console.error("   プロジェクトルートに .env を作成し、DATABASE_URL を設定してください。\n");
  console.error("   例:");
  console.error('   DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"\n');
  process.exit(1);
}

const content = readFileSync(envPath, "utf-8");
const match = content.match(/^DATABASE_URL=(.*)$/m);

if (!match) {
  console.error("❌ .env に DATABASE_URL が見つかりません。\n");
  process.exit(1);
}

const value = match[1].trim().replace(/^["']|["']$/g, "");

if (!value) {
  console.error("❌ DATABASE_URL が空です。");
  console.error("   .env を開いて Neon の接続文字列を貼り付けてください。\n");
  process.exit(1);
}

if (value.includes("USER:PASSWORD")) {
  console.error("❌ DATABASE_URL がサンプルのままです。実際の接続文字列に置き換えてください。\n");
  process.exit(1);
}

console.log("✅ .env と DATABASE_URL を確認しました。\n");
console.log("次のコマンドを実行してください:");
console.log("   npm run db:push");
console.log("   npm run dev\n");
