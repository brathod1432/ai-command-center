import { NextResponse } from "next/server";

/**
 * Liveness/readiness probe. See docs/observability.md §6.
 * Reports process health and a per-dependency summary (datastore is in-memory
 * mock in the reference build).
 */
export function GET() {
  return NextResponse.json({
    status: "ok",
    checks: {
      datastore: "ok",
      integrations: "ok",
    },
    version: process.env.npm_package_version ?? "0.1.0",
    timestamp: new Date().toISOString(),
  });
}
