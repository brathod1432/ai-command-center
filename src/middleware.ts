import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  refreshedPayload,
  sessionCookieOptions,
  signSession,
  verifySession,
} from "@/lib/auth/session";

/**
 * Route protection. Public routes are allowlisted; everything else requires a
 * valid session. Unauthenticated page requests redirect to /login (?next=…);
 * unauthenticated API requests get 401. See docs/security-model.md §4.
 */

const PUBLIC_PATHS = new Set<string>(["/", "/login", "/showcase"]);
const PUBLIC_PREFIXES = ["/api/auth", "/api/health", "/showcase", "/.well-known"];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

/**
 * Content-Security-Policy. In production, scripts are locked to a per-request
 * nonce + strict-dynamic (no 'unsafe-inline'). Dev keeps the relaxed policy
 * Next's HMR needs. See docs/improvements-v4.md §2 (S1).
 */
function buildCsp(nonce: string): string {
  const prod = process.env.NODE_ENV === "production";
  const scriptSrc = prod ? `'self' 'nonce-${nonce}' 'strict-dynamic'` : "'self' 'unsafe-eval' 'unsafe-inline'";
  return [
    "default-src 'self'",
    "img-src 'self' data: blob:",
    "style-src 'self' 'unsafe-inline'",
    `script-src ${scriptSrc}`,
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Per-request nonce; forwarded to Next so it tags its own scripts.
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const withCsp = (res: NextResponse) => {
    res.headers.set("Content-Security-Policy", csp);
    return res;
  };
  const next = () => NextResponse.next({ request: { headers: requestHeaders } });

  if (isPublic(pathname)) return withCsp(next());

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  if (!session) {
    if (pathname.startsWith("/api")) {
      return withCsp(NextResponse.json({ error: "Authentication required" }, { status: 401 }));
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return withCsp(NextResponse.redirect(url));
  }

  // Sliding refresh: extend the idle window on activity (capped by absExp).
  const res = next();
  const refreshed = refreshedPayload(session);
  if (refreshed) {
    res.cookies.set(SESSION_COOKIE, await signSession(refreshed), sessionCookieOptions());
  }
  return withCsp(res);
}

export const config = {
  // Run on everything except static assets and common metadata files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.webmanifest|icon.svg).*)"],
};
