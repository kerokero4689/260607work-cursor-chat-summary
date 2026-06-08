/**
 * ルートの .env に DATABASE_URL を設定してください。
 * Next.js / Prisma はプロジェクトルートの .env を自動で読み込みます。
 */
export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();

  if (!url) {
    throw new Error(
      "DATABASE_URL が設定されていません。プロジェクトルートの .env に Neon の接続文字列を入力してください。"
    );
  }

  if (url.includes("USER:PASSWORD") || url === '""' || url === "''") {
    throw new Error(
      "DATABASE_URL がプレースホルダーのままです。.env を開いて実際の接続文字列に置き換えてください。"
    );
  }

  return url;
}

export function isDatabaseConfigured(): boolean {
  try {
    getDatabaseUrl();
    return true;
  } catch {
    return false;
  }
}
