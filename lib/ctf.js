import crypto from "crypto";

const CRED_POOL = [
  ["trinity", "matrix"],
  ["smith", "agent"],
  ["oracle", "cookie"],
  ["keymaker", "lock"],
  ["spoon", "nospoon"],
];

function secret() {
  return process.env.CTF_SECRET || "dev-only-change-me";
}

export function newSessionId() {
  return crypto.randomBytes(24).toString("hex");
}

export function pairForSession(sessionId) {
  const digest = crypto.createHmac("sha256", secret()).update(sessionId).digest();
  return CRED_POOL[digest.readUInt32BE(0) % CRED_POOL.length];
}

function cookieName() { return process.env.NODE_ENV === "production" ? "__Host-matrix-session" : "matrix-session"; }

export function getOrCreateSession(request) {
  const current = request.cookies.get(cookieName())?.value;
  return { id: current || newSessionId(), isNew: !current };
}

export function attachSession(response, session) {
  if (session.isNew) {
    response.cookies.set(cookieName(), session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 6,
    });
  }
  return response;
}
