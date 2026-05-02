import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code  = searchParams.get("code")  ?? "";
  const state = searchParams.get("state") ?? "";
  const error = searchParams.get("error") ?? "";

  if (error || !code) {
    return NextResponse.redirect(new URL(`/login?error=google_denied`, req.url));
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/google/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, state }),
    });

    if (!res.ok) {
      throw new Error(`exchange_failed: ${res.status}`);
    }

    const { token, next } = await res.json();
    const safeNext = typeof next === "string" && next.startsWith("/") ? next : "/";

    return NextResponse.redirect(
      new URL(`/auth/callback?token=${encodeURIComponent(token)}&next=${encodeURIComponent(safeNext)}`, req.url)
    );
  } catch {
    return NextResponse.redirect(new URL(`/login?error=google_failed`, req.url));
  }
}
