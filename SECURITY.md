# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Helm, please report it responsibly:

- **Email:** bgrathod00@gmail.com (subject: `SECURITY — Helm`)
- Please **do not** open a public issue for security reports.
- Include: a description, steps to reproduce, affected version/commit, and impact.

We aim to acknowledge reports within a few business days and will keep you updated on remediation. Please give us reasonable time to release a fix before any public disclosure.

## Supported Versions

This is a reference implementation. Security fixes are applied to the `main` branch.

## Security Model (summary)

Helm is built security-first. Key controls (see [`docs/security-model.md`](docs/security-model.md)):

- **Authentication & sessions** — signed, HttpOnly, SameSite cookies; expiry; no session data in `localStorage`.
- **Route protection** — middleware guards all app routes; public surfaces are allowlisted.
- **RBAC, server-enforced** — authorization checked in API route handlers (defense in depth), fail-closed.
- **Governance invariant** — no consequential action executes without an authorized human approval and an immutable audit record; agents cannot mutate systems.
- **Input validation** — all API input validated with Zod.
- **CSRF** — same-origin checks on state-changing requests.
- **Rate limiting** — in-memory token bucket on auth and mutating endpoints.
- **Security headers** — CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`.
- **Secrets** — provided via environment; the app fails closed if `SESSION_SECRET` is unset in production.
- **Supply chain** — pinned dependencies, lockfile, `npm audit` in CI, Dependabot, and a preference for aged releases.

## Handling of Secrets

Never commit secrets. Copy `.env.example` to `.env.local` for local development. `.env*` files (except the example) are git-ignored.
