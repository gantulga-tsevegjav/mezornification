import { NextResponse } from "next/server";
import { attachSession, getOrCreateSession, pairForSession } from "../../../../lib/ctf";

export const runtime = "nodejs";

export async function GET(request) {
  const session = getOrCreateSession(request);
  const [user, pass] = pairForSession(session.id);
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind") === "pass" ? "pass" : "user";
  const value = (kind === "pass" ? pass : user).toUpperCase();
  // Only requested when a Matrix-rain secret is about to be rendered.
  return attachSession(NextResponse.json({ value }, { headers: { "Cache-Control": "no-store" } }), session);
}
