import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

/**
 * Route protection. Public routes are allowlisted; everything else requires a
 * valid session. Unauthenticated page requests redirect to /login (?next=…);
 * unauthenticated API requests get 401. See docs/security-model.md §4.
 */

const PUBLIC_PATHS = new Set<string>(["/", "/login", "/showcase"]);
const PUBLIC_PREFIXES = ["/api/auth", "/api/health", "/showcase"];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  if (!session) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except static assets and common metadata files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.webmanifest|icon.svg).*)"],
};
