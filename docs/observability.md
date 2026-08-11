# Observability — Helm

> **Phase 13 — Observability.** Metrics, logging, tracing, monitoring, health checks, and error tracking for Helm.

**Document status:** Phase 13 · **Last updated:** 2026-08-11

---

## 1. Goals

- Know the system's health at a glance (RED/USE signals).
- Trace a request/agent-run end to end.
- Attribute every log/metric to tenant, actor, and correlation ID (without leaking PII).
- Detect and triage errors fast.

Observability is implemented behind small interfaces in `lib/observability` so the reference build uses console/structured stdout, and production swaps in OpenTelemetry + a backend (e.g., Prometheus/Grafana, an APM, and a log store) without app changes.

---

## 2. Logging

- **Structured JSON logs** with a stable schema; no free-text-only logs.
- **Standard fields:** `timestamp, level, message, service, env, tenantId, actorId, correlationId, route, latencyMs`.
- **Levels:** `debug | info | warn | error`. Production defaults to `info`.
- **PII/secret hygiene:** redact tokens, passwords, and sensitive fields at the logger boundary; never log request bodies containing secrets.
- **Correlation:** a `correlationId` (from incoming header or generated) threads through request → domain → integration calls.

```ts
logger.info('agent.run.completed', {
  correlationId, tenantId, agentId: 'sales',
  insights: 7, latencyMs: 812
});
```

---

## 3. Metrics

Adopt **RED** (Rate, Errors, Duration) for endpoints and **USE** (Utilization, Saturation, Errors) for resources.

| Metric | Type | Purpose |
|---|---|---|
| `http_requests_total{route,method,status}` | counter | request rate + error rate |
| `http_request_duration_seconds{route}` | histogram | latency (p50/p95/p99) |
| `agent_runs_total{agent,outcome}` | counter | agent activity/health |
| `agent_run_duration_seconds{agent}` | histogram | agent latency |
| `insights_generated_total{agent,severity}` | counter | insight volume/mix |
| `approvals_total{tier,outcome}` | counter | governance throughput |
| `approval_latency_seconds{tier}` | histogram | time-to-decision |
| `integration_calls_total{provider,status}` | counter | integration health |
| `rate_limit_block_total{route}` | counter | abuse/limits |

**Business KPIs** (recommendation acceptance rate, actions/week) are also emitted as metrics to correlate product outcomes with system behavior.

---

## 4. Distributed Tracing

- **OpenTelemetry**-style spans: `http.request → domain.operation → agent.run → integration.call`.
- Each span carries `tenantId`, `correlationId`, and status.
- Sampling: 100% for errors and T3 governance flows; head-based sampling for the rest.
- Traces link to logs (shared `correlationId`) and to the audit record where a governance action occurred.

---

## 5. Monitoring & Alerting

- **Dashboards:** latency (p95/p99), error rate, agent-run success, approval latency, integration health.
- **SLOs (examples):** API availability 99.9%; p95 page data latency < 500ms; agent-run success > 99%.
- **Alerts (examples):** error-rate burn-rate alerts, p99 latency breach, integration provider failing, approval SLA breaches, audit-write failures (page immediately — audit integrity is critical).

---

## 6. Health Checks

- `GET /api/health` — **liveness**: process is up.
- `GET /api/health/ready` — **readiness**: datastore + critical deps reachable; returns per-dependency status.
- Integration adapters expose `healthCheck()`; the integrations page shows live status and degrades gracefully.

```json
{ "status": "ok", "checks": { "datastore": "ok", "integrations": "degraded" }, "version": "x.y.z" }
```

---

## 7. Error Tracking

- Client + server errors captured with correlation ID, route, tenant (no PII), and release version.
- Reference build logs structured errors; production swaps in an error-tracking backend.
- **Error boundaries** per route render a safe fallback and report the error; users see a friendly message with a correlation ID for support.

---

## 8. Frontend / Web Vitals

- Capture Core Web Vitals (LCP, CLS, INP) via the web-vitals hook; report to the metrics pipeline.
- Track route-level load and hydration timing to protect the Lighthouse Performance target (≥ 90).

---

## 9. Auditability vs. Observability

Observability is operational (health/performance) and may be sampled/rotated. The **audit log** (see `governance.md`) is a **separate, immutable, complete** record for compliance. They share `correlationId` for cross-reference but have different retention and integrity guarantees.

---

## 10. Reference Implementation Notes

- `lib/observability/logger.ts` — structured logger + redaction.
- `lib/observability/metrics.ts` — counter/histogram interface (no-op/console in dev).
- `lib/observability/trace.ts` — span helpers (OTel-ready).
- API route handlers wrap logic in a `withObservability()` helper that records metrics, starts a span, and logs with correlation.
