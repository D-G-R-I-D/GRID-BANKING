# GRID Banking

A clearer bank — a student full-stack project. Next.js (App Router) + TypeScript,
Postgres via Prisma, one repo for frontend and API.

> Not a licensed financial service.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript strict |
| Styling | Tailwind CSS v4 + design tokens (`app/globals.css`) |
| Data | PostgreSQL + Prisma |
| Auth | email + password, session in an `httpOnly` cookie (`iron-session`) |
| Validation | Zod (shared client + server) |
| Tests | Vitest + Testing Library, Playwright (e2e) |
| Deploy | Vercel + a hosted Postgres (Neon / Supabase) — not wired yet |

## Run it locally

```bash
# 1. Start Postgres
docker compose up -d

# 2. Install + set up env
npm install
cp .env.example .env          # the defaults match docker-compose

# 3. Create the schema and seed a demo user
npx prisma db push
npm run db:seed                # demo@grid.bank / demo-password-123

# 4. Go
npm run dev                    # http://localhost:3000
```

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | dev server |
| `npm run build` | `prisma generate` + `next build` |
| `npm run lint` / `format` / `typecheck` | quality checks |
| `npm test` / `test:ci` | unit + component tests |
| `npm run test:e2e` | Playwright end-to-end |
| `npm run db:migrate` / `db:seed` / `db:reset` | database |

## Docs

- [`docs/PROJECT-PLAN.md`](docs/PROJECT-PLAN.md) — what we're building and why
- [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) — how the code is organised
- [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) — branches, PRs, review
- [`SECURITY.md`](SECURITY.md)

## Branches

`feature/*` → `dev` → `main`. `dev` is the default. Both are protected: every
change is a PR that passes CI and gets one approval from **@D-G-R-I-D** before
it merges.
