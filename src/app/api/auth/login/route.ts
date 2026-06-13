import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, getAppPassword } from "@/lib/auth";
import {
  createSessionToken,
  getAuthSecret,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth-session";

export async function POST(request: NextRequest) {
  try {
    getAppPassword();
    getAuthSecret();
  } catch (error) {
    console.error("Auth env not configured:", error);
    return NextResponse.json(
      { error: "Server authentication is not configured" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const password = String(body.password ?? "");

  if (!verifyPassword(password)) {
    return NextResponse.json(
      { error: "パスワードが正しくありません" },
      { status: 401 }
    );
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}
