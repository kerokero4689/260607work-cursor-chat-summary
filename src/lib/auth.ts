import { timingSafeEqual } from "crypto";

export function getAppPassword(): string {
  const password = process.env.MY_APP_PASSWORD?.trim();
  if (!password) {
    throw new Error(
      "MY_APP_PASSWORD が設定されていません。.env にログイン用パスワードを追加してください。"
    );
  }
  return password;
}

export function verifyPassword(input: string): boolean {
  try {
    const expected = getAppPassword();
    const a = Buffer.from(input);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
