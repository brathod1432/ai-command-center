import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/auth/session";

/**
 * Read the double-submit CSRF token from the (non-HttpOnly) cookie and return
 * it as a request header. Used by client mutations. See docs/improvements-v3.md §4.
 */
export function csrfHeaders(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]+)`));
  return match ? { [CSRF_HEADER]: decodeURIComponent(match[1]) } : {};
}
