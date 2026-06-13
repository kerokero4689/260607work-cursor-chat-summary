import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const root = resolve(process.cwd());
const envPath = resolve(root, ".env");

function readEnvValue(name) {
  const content = readFileSync(envPath, "utf-8");
  const match = content.match(new RegExp(`^${name}=(.*)$`, "m"));
  if (!match) return null;
  return match[1].trim().replace(/^["']|["']$/g, "");
}

console.log("\n📁 Cursor Chat Archive - 環境チェック\n");

if (!existsSync(envPath)) {
  console.error("❌ .env ファイルがありません。");
  console.error("   プロジェクトルートに .env を作成してください。\n");
  process.exit(1);
}

const checks = [
  {
    name: "DATABASE_URL",
    validate: (v) => v && !v.includes("USER:PASSWORD"),
    emptyMsg: "DATABASE_URL が空です。Neon の接続文字列を貼り付けてください。",
    missingMsg: ".env に DATABASE_URL が見つかりません。",
    placeholderMsg: "DATABASE_URL がサンプルのままです。",
  },
  {
    name: "MY_APP_PASSWORD",
    validate: (v) => v && v.length >= 4,
    emptyMsg: "MY_APP_PASSWORD が空です。ログイン用パスワードを設定してください。",
    missingMsg: ".env に MY_APP_PASSWORD が見つかりません。",
    placeholderMsg: "MY_APP_PASSWORD がサンプルのままです。",
  },
  {
    name: "AUTH_SECRET",
    validate: (v) => v && v.length >= 16 && !v.includes("your-random"),
    emptyMsg: "AUTH_SECRET が空です。16文字以上のランダム文字列を設定してください。",
    missingMsg: ".env に AUTH_SECRET が見つかりません。",
    placeholderMsg: "AUTH_SECRET がサンプルのままです。",
  },
];

for (const check of checks) {
  const value = readEnvValue(check.name);
  if (value === null) {
    console.error(`❌ ${check.missingMsg}\n`);
    process.exit(1);
  }
  if (!value) {
    console.error(`❌ ${check.emptyMsg}\n`);
    process.exit(1);
  }
  if (!check.validate(value)) {
    console.error(`❌ ${check.placeholderMsg}\n`);
    process.exit(1);
  }
}

console.log("✅ .env の必須項目を確認しました。");
console.log("   DATABASE_URL / MY_APP_PASSWORD / AUTH_SECRET\n");
console.log("次のコマンド:");
console.log("   npm run db:push   # 初回のみ");
console.log("   npm run dev\n");
