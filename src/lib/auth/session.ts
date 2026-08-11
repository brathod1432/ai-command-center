import { z } from "zod";
import { RoleSchema } from "@/lib/types";

/**
 * Signed session tokens using Web Crypto (HMAC-SHA-256) so the same code runs
 * in both the Edge middleware and Node route handlers. See docs/security-model.md §3.
 *
 * NOTE: This is a reference/demo auth. The token shape and cookie flags are
 * production-grade, but the credential check is a mock (see /api/auth/login).
 * Swap in a real IdP/OIDC without changing the session interface.
 */

export const SESSION_COOKIE = "helm_session";
export const CSRF_COOKIE = "helm_csrf";
export const CSRF_HEADER = "x-csrf-token";

/** Idle window: a session must see activity within this window (sliding). */
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours
/** Absolute cap: even active sessions expire at this age since first login. */
export const SESSION_ABSOLUTE_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export const SessionPayloadSchema = z.object({
  userId: z.string(),
  tenantId: z.string(),
  role: RoleSchema,
  name: z.string(),
  email: z.string(),
  exp: z.number(), // sliding/idle expiry (epoch seconds)
  iat: z.number().optional(), // issued-at (epoch seconds)
  absExp: z.number().optional(), // absolute expiry cap (epoch seconds)
});
export type SessionPayload = z.infer<typeof SessionPayloadSchema>;

/** Build a fresh session payload at login. */
export function newSessionPayload(base: Pick<SessionPayload, "userId" | "tenantId" | "role" | "name" | "email">): SessionPayload {
  const now = Math.floor(Date.now() / 1000);
  return {
    ...base,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    absExp: now + SESSION_ABSOLUTE_TTL_SECONDS,
  };
}

/**
 * Sliding refresh: extend the idle expiry on activity, capped by the absolute
 * expiry. Returns null when no refresh is needed or possible.
 */
export function refreshedPayload(p: SessionPayload, nowMs = Date.now()): SessionPayload | null {
  const now = Math.floor(nowMs / 1000);
  const abs = p.absExp ?? now + SESSION_ABSOLUTE_TTL_SECONDS;
  if (now >= abs) return null; // absolute cap reached
  const nextExp = Math.min(now + SESSION_TTL_SECONDS, abs);
  if (nextExp <= p.exp) return null; // nothing meaningful to extend
  return { ...p, exp: nextExp, absExp: abs };
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret === "dev-only-change-me") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET must be set to a strong value in production");
    }
    return "dev-only-change-me";
  }
  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Sign a session payload into a `payload.signature` token. */
export async function signSession(payload: SessionPayload): Promise<string> {
  const key = await importKey(getSecret());
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return `${body}.${toBase64Url(new Uint8Array(sig))}`;
}

/** Verify and decode a token. Returns null if invalid, tampered, or expired. */
export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const key = await importKey(getSecret());
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(sig),
      new TextEncoder().encode(body),
    );
    if (!valid) return null;
    const json = new TextDecoder().decode(fromBase64Url(body));
    const parsed = SessionPayloadSchema.safeParse(JSON.parse(json));
    if (!parsed.success) return null;
    const now = Date.now();
    if (parsed.data.exp * 1000 < now) return null; // idle/sliding expiry
    if (parsed.data.absExp && parsed.data.absExp * 1000 < now) return null; // absolute cap
    return parsed.data;
  } catch {
    return null;
  }
}

/** Cookie options for the session cookie (hardened). */
export function sessionCookieOptions(maxAgeSeconds = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
