# Knowledge Architecture — Helm

> **Phase 10 — Knowledge Platform.** A structured knowledge layer that captures institutional memory and is **retrieval-ready** for future AI (RAG) use.

**Document status:** Phase 10 · **Last updated:** 2026-08-11

---

## 1. Purpose

Turn scattered institutional knowledge into a governed, searchable, citation-friendly corpus that:
- Helps leaders find answers fast.
- Backs the **Knowledge Agent** with cited responses.
- Is structured for future **retrieval-augmented generation (RAG)** without re-architecting.

---

## 2. Supported Content Types

| Type | Examples | Typical owner |
|---|---|---|
| Policies | Security, refund, HR, compliance | Ops / Legal |
| Procedures | Onboarding, offboarding, escalation | Ops |
| Meeting notes | Standups, board, planning | All |
| Runbooks | Incident response, on-call | Engineering |
| Architecture docs | System designs, ADRs | Engineering |
| Playbooks | Sales, CS, support | GTM |
| Product documentation | Specs, release notes, FAQs | Product |

---

## 3. Knowledge Object Model

```ts
interface KnowledgeDoc {
  id: string;
  tenantId: string;
  type: 'policy'|'procedure'|'meeting_note'|'runbook'|'architecture'|'playbook'|'product_doc';
  title: string;
  body: string;                 // markdown (sanitized on render)
  tags: string[];
  owner: string;                // accountable person/role
  source?: { provider: string; externalId?: string; url?: string };
  version: number;
  status: 'draft'|'published'|'archived';
  createdAt: string; updatedAt: string;
  // RAG-readiness (future):
  chunks?: KnowledgeChunk[];    // pre-split segments
}

interface KnowledgeChunk {
  id: string;
  docId: string;
  ordinal: number;
  text: string;
  embedding?: number[];         // populated when a vector store is enabled
  metadata: { section?: string; headings?: string[] };
}
```

Every doc carries `tenantId`, `owner`, `version`, and `status` — enabling governance, freshness tracking, and tenant isolation.

---

## 4. Ingestion & Lifecycle

```
Source (mock adapters / manual) ─► Normalize ─► Chunk ─► (future) Embed ─► Index ─► Serve
                                        │
                                   Governance: publish/archive requires approval
```

1. **Ingest** from mock providers (Confluence, Google Workspace, M365) or manual authoring.
2. **Normalize** to `KnowledgeDoc` (Zod-validated).
3. **Chunk** into `KnowledgeChunk[]` (heading-aware) — done now so the corpus is RAG-ready.
4. **Embed** (future) — pluggable embedding step populates `embedding`.
5. **Index** — keyword/full-text now; vector index later behind the same query interface.
6. **Serve** — search UI + Knowledge Agent answers with **citations** to `docId`/section.

**Lifecycle & governance:** publishing or altering official docs is a governed action (see `governance.md`). Freshness is tracked; stale critical docs raise a Knowledge Agent insight.

---

## 5. Retrieval Interface (RAG-ready)

A single retrieval contract abstracts the current keyword search from future vector search:

```ts
interface KnowledgeRetriever {
  search(query: string, opts?: { tenantId: string; types?: string[]; limit?: number }):
    Promise<RetrievedChunk[]>;   // returns text + citation metadata + score
}
```

- **Today:** `KeywordRetriever` over indexed chunks (deterministic, testable, no external calls).
- **Future:** `VectorRetriever` (same interface) backed by an embedding model + vector DB, or a hybrid (keyword + vector) reranker.
- **Answers always cite sources** — the Knowledge Agent returns `answer + citations[]`, never uncited claims.

---

## 6. Security, Privacy & Access

- **Tenant isolation:** all queries scoped by `tenantId`.
- **RBAC on documents:** visibility respects roles (e.g., HR/legal policies restricted). See `security-model.md`.
- **Sanitization:** markdown rendered through a sanitizer; no raw HTML injection.
- **PII handling:** ingestion can flag/redact sensitive fields; exports are governed and audited.
- **Auditability:** publish/archive/access-to-sensitive events are logged.

---

## 7. Search UX (in `/knowledge`)

- Full-text search with type/tag/owner filters.
- Result cards show title, type, owner, freshness, and snippet with highlighted match.
- Doc view renders sanitized markdown with a "cited by" panel (which agents/insights reference it).
- Empty, loading, and error states per the design system.

---

## 8. Future AI Retrieval Readiness — Checklist

- [x] Stable `KnowledgeDoc` + `KnowledgeChunk` schema with `tenantId`.
- [x] Heading-aware chunking at ingestion.
- [x] Retriever interface decoupled from implementation.
- [x] Citations as a first-class output.
- [ ] Embedding step + vector store (future).
- [ ] Hybrid reranking (future).
- [ ] Feedback capture on answer quality (future closed-loop).

This ensures the jump to full RAG is an **implementation swap**, not a redesign.
