/**
 * Structured, PII-aware logger. Console-backed in the reference build; swap for
 * an OpenTelemetry/log backend in production. See docs/observability.md §2.
 */

type Level = "debug" | "info" | "warn" | "error";

const REDACT_KEYS = ["password", "secret", "token", "authorization", "cookie", "sessionSecret"];

function redact(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    out[k] = REDACT_KEYS.some((r) => k.toLowerCase().includes(r)) ? "[redacted]" : v;
  }
  return out;
}

function emit(level: Level, message: string, meta: Record<string, unknown> = {}) {
  const record = {
    level,
    message,
    service: "helm",
    env: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
    ...redact(meta),
  };
  // eslint-disable-next-line no-console
  const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  fn(JSON.stringify(record));
}

export const logger = {
  debug: (m: string, meta?: Record<string, unknown>) => emit("debug", m, meta),
  info: (m: string, meta?: Record<string, unknown>) => emit("info", m, meta),
  warn: (m: string, meta?: Record<string, unknown>) => emit("warn", m, meta),
  error: (m: string, meta?: Record<string, unknown>) => emit("error", m, meta),
};
