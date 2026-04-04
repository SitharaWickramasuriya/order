const ADMIN_USER = process.env.ADMIN_USER ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET ?? "change-me";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 4; // 4 hours

function base64UrlEncode(value: string) {
  if (typeof btoa === "function") {
    return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  // Node.js fallback
  return Buffer.from(value, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "===".slice((normalized.length + 3) % 4);
  if (typeof atob === "function") {
    return atob(padded);
  }
  // Node.js fallback
  return Buffer.from(padded, "base64").toString("utf8");
}

function buildToken(username: string, expiresAt: number) {
  const payload = `${username}:${expiresAt}:${ADMIN_TOKEN_SECRET}`;
  return base64UrlEncode(payload);
}

export function verifyCredentials(username: string, password: string) {
  return username === ADMIN_USER && password === ADMIN_PASSWORD;
}

export function createSession(username: string) {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const token = buildToken(username, expiresAt);
  return { token, expiresAt };
}

export function validateSessionToken(token?: string) {
  if (!token) return null;
  try {
    const decoded = base64UrlDecode(token);
    const [username, expStr, secret] = decoded.split(":");
    if (!username || !expStr || secret !== ADMIN_TOKEN_SECRET) return null;
    const expiresAt = Number(expStr);
    if (Number.isNaN(expiresAt) || expiresAt < Date.now()) return null;
    return { username };
  } catch (err) {
    console.error("Failed to validate session token", err);
    return null;
  }
}

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
