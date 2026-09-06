# GRID Banking — Frontend

A futuristic banking web app. Clearer than a bank, not louder. Portfolio-grade:
typed, tested, accessible, secure.

> Not a live financial service. See [`SECURITY.md`](SECURITY.md).

## Stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind v4 · TanStack
Query · Radix UI · WebAuthn/passkeys · Playwright · Vitest · Storybook.
Backend is a separate **Java + Spring Boot** service; this repo is **frontend +
BFF** and develops against the OpenAPI contract with MSW mocks.

## Docs

| Doc | What |
| --- | --- |
| [`docs/PROJECT-PLAN.md`](docs/PROJECT-PLAN.md) | Vision, architecture, design system, security, milestones |
| [`docs/BUILD-PROMPT.md`](docs/BUILD-PROMPT.md) | The build spec for the coding agent (v1) |
| [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) | Branching model, PR rules, definition of done |
| [`SECURITY.md`](SECURITY.md) | Vulnerability reporting |

## Branches

`feature/*` → `dev` → `staging` → `main` (production). `dev` is the default
branch. Nobody pushes to a protected branch directly. See
[`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md).

## Getting started

The app is scaffolded in milestone **M0** (see the build prompt). After that:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

## Repo setup (maintainer, one-time)

```bash
gh auth login
scripts/setup-branch-protection.sh          # branch protection + repo settings
# after the M0 scaffold merges:
scripts/setup-branch-protection.sh with-ci  # also require CI checks to pass
```
