# Contributing to Helm

Thanks for your interest in improving Helm — the AI Business Operations Platform. This guide covers how to set up, make changes, and open a pull request.

## Code of Conduct

Be respectful and constructive. Assume good intent, give actionable feedback, and keep discussions focused on the work.

## Development Setup

**Prerequisites:** Node.js `>=18.18` and npm.

```bash
npm install
npm run dev        # http://localhost:3000
```

## Before You Open a PR

Please make sure the full local verification passes:

```bash
npm run typecheck   # TypeScript (strict), no emit
npm run lint        # ESLint
npm test            # Jest unit + component + a11y tests
npm run build       # production build
```

For end-to-end changes, also run:

```bash
npm run test:e2e:install   # one-time: install browsers
npm run test:e2e           # Playwright smoke + a11y journeys
```

## Project Conventions

- **TypeScript first.** Prefer strict, well-typed code. Contracts live as Zod schemas in `src/lib/types` — extend those rather than duplicating shapes.
- **Governance is a hard invariant.** No code path may cause a consequential action to execute without a human approval record. See `docs/ai-safety.md` and `docs/governance.md`.
- **Accessibility.** Components target WCAG 2.1 AA. Prefer semantic HTML and accessible queries in tests (`getByRole`, `getByLabelText`). Do not convey meaning by color alone.
- **Security.** Validate all external input with Zod. Never introduce raw HTML injection (`dangerouslySetInnerHTML` on untrusted data is disallowed by lint). Never commit secrets.
- **Styling.** Use the design tokens in `src/app/globals.css` and Tailwind; follow `docs/design-system.md`.
- **Tests.** Add or update tests with every change. Bug fixes should include a regression test.

## Commit & PR Guidelines

- Write clear, imperative commit messages that explain the *why*.
- Keep PRs focused and reasonably small.
- Describe the change, testing performed, and any doc updates in the PR description.
- Update relevant docs in `docs/` when behavior or architecture changes.

## Dependencies

- Prefer well-established, permissively licensed packages.
- Avoid floating version ranges; pin versions.
- Run `npm audit` and address vulnerabilities before merging.

## Questions

Open an issue or reach out at **bgrathod00@gmail.com**.
