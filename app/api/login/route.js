import { NextResponse } from "next/server";
import crypto from "crypto";
import { attachSession, getOrCreateSession, pairForSession } from "../../../lib/ctf";

export const runtime = "nodejs";

function same(a, b) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

export async function POST(request) {
  const session = getOrCreateSession(request);
  const [expectedUser, expectedPass] = pairForSession(session.id);
  const body = await request.json().catch(() => ({}));
  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "").trim().toLowerCase();
  const ok = same(username, expectedUser) && same(password, expectedPass);
  return attachSession(NextResponse.json({ ok }, { status: ok ? 200 : 401 }), session);
}
