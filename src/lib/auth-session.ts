const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a[i] ^ b[i];
  return result === 0;
}

async function signHmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return toBase64Url(new Uint8Array(signature));
}

interface SessionPayload {
  auth: true;
  iat: number;
}

export const SESSION_COOKIE = "cca_session";

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET が未設定か短すぎます。.env に16文字以上のランダム文字列を設定してください。"
    );
  }
  return secret;
}

export async function createSessionToken(): Promise<string> {
  const payload: SessionPayload = { auth: true, iat: Date.now() };
  const encoded = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await signHmac(encoded, getAuthSecret());
  return `${encoded}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return false;

    const expected = await signHmac(encoded, getAuthSecret());
    const sigBuf = fromBase64Url(signature);
    const expBuf = fromBase64Url(expected);
    if (!timingSafeEqual(sigBuf, expBuf)) return false;

    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(encoded))
    ) as SessionPayload;

    return payload.auth === true;
  } catch {
    return false;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

export async function isAuthenticated(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;
  return verifySessionToken(token);
}
