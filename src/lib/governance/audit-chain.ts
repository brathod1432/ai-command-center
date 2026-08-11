import { createHash } from "node:crypto";
import type { AuditRecord } from "@/lib/types";

/**
 * Tamper-evident audit log via a SHA-256 hash chain. Each record's `hash`
 * covers all of its fields (including `prevHash`), so any insertion, edit, or
 * reordering breaks the chain and is detectable. See docs/improvements-v2.md §4 (S1).
 */

export const GENESIS_HASH = "GENESIS";

/** Deterministic serialization (sorted keys, recursive) for stable hashing. */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

/** Compute the hash for a record (everything except `hash` itself). */
export function computeHash(recordSansHash: Omit<AuditRecord, "hash">): string {
  return createHash("sha256").update(stableStringify(recordSansHash)).digest("hex");
}

export interface ChainStatus {
  ok: boolean;
  count: number;
  brokenAt?: string;
}

/** Verify a chronologically-ordered list of records forms an intact chain. */
export function verifyChain(recordsChrono: AuditRecord[]): ChainStatus {
  let prev = GENESIS_HASH;
  for (const r of recordsChrono) {
    const { hash, ...rest } = r;
    if (r.prevHash !== prev || !hash || computeHash(rest) !== hash) {
      return { ok: false, count: recordsChrono.length, brokenAt: r.id };
    }
    prev = hash;
  }
  return { ok: true, count: recordsChrono.length };
}
