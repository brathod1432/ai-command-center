import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "@/lib/auth/session";

/**
 * Read the current session in a Server Component / Route Handler.
 * Returns null if unauthenticated. See docs/security-model.md §4.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}
