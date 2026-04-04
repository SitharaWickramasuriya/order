import { badRequest, jsonOk, parseJson } from "@/lib/api";
import { ADMIN_SESSION_COOKIE, createSession, sessionCookieOptions, verifyCredentials } from "@/lib/auth";

type LoginBody = { username: string; password: string };

export async function POST(request: Request) {
  const { username, password } = await parseJson<LoginBody>(request);
  if (!username || !password) return badRequest("Username and password are required");

  const ok = verifyCredentials(username, password);
  if (!ok) return badRequest("Invalid credentials");

  const session = createSession(username);
  const response = jsonOk({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, session.token, sessionCookieOptions(60 * 60 * 4));
  return response;
}
