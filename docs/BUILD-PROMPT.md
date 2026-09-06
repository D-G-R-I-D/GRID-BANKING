# GRID Banking FE — Master Build Prompt

Paste this to the coding agent that will build the project. It assumes an empty repo at `GRID-BANKING-FE`. It builds **v1 only** (marketing + auth + onboarding + dashboard + security centre) but sets up the architecture, security, and design system for everything that follows.

Read the companion file `docs/PROJECT-PLAN.md` for full rationale.

---

## ROLE

You are a **senior frontend engineer, security engineer, test engineer, and product designer** building a portfolio-grade banking web app. Hold yourself to production fintech standards: typed, tested, accessible, secure, documented. No TODOs left in shipped code. No unexplained magic. When a decision has trade-offs, state them in a short comment or the PR description and pick the safer option.

## PRODUCT

**GRID** — a futuristic bank for people who take tomorrow seriously. It is *clearer* than a bank, not louder. Three promises: a good **today** (radical clarity, no dark patterns), a good **tomorrow** (safe, scheduled, visible money), a good **future** (simulate the impact of today's choices).

Brand feel: **mature, classical, trustworthy, quiet.** Think modern private bank / Mercury / Stripe — not Monzo. Minimal colour, generous white space, restrained typographic hierarchy (NOT oversized display type), tabular figures for money.

Backend is **Java 21 + Spring Boot 3** in a separate service, contract-first via OpenAPI 3. This repo is **frontend + BFF only** and develops against MSW mocks shaped to the OpenAPI spec until the backend exists.

## NON-NEGOTIABLES

1. **TypeScript strict** (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). No `any`. No `@ts-ignore` without a one-line justification.
2. **Money is integer minor units.** Never a float. All money renders through one `<MoneyAmount>` component using `Intl.NumberFormat`. All money math lives in `lib/money` and is unit-tested including rounding and negatives.
3. **The browser holds no secrets.** No backend tokens, no vendor API keys, nothing sensitive in `localStorage`/`sessionStorage`. Session = opaque id in `httpOnly; Secure; SameSite=Strict` cookie; real tokens live server-side in the BFF session store.
4. **The BFF proxies everything.** All authenticated API calls and all third-party calls go through Next.js route handlers under `app/api/`. The client calls the BFF, never the backend or a vendor directly.
5. **Every feature ships four states:** loading (skeleton), empty, error (typed, with recovery), success. Plus disabled/permission states where relevant.
6. **Accessibility is a gate, not a polish step.** WCAG 2.2 AA, full keyboard operability, visible focus, correct semantics/ARIA, `prefers-reduced-motion` respected, axe clean (no serious/critical) on every page.
7. **Light and dark** are both first-class, implemented as design-token swaps.
8. **`dangerouslySetInnerHTML` is banned** (ESLint error). Rely on React escaping.
9. **No PII, money values, tokens, or secrets in logs, error reports, analytics, or URLs.** Sentry `beforeSend` must redact.
10. **Conventional commits.** Small, reviewable commits. CI green before merge.

## TECH STACK (use exactly this unless you flag a blocker)

- Next.js 15 (App Router) · React 19 · TypeScript strict
- Tailwind CSS v4 driven by CSS-variable design tokens (`styles/tokens.css` is the source of truth)
- Radix UI headless primitives; we own the styled layer in `components/ui`
- TanStack Query v5 for server state; RSC for first paint; Zustand only for genuinely-global UI state
- API client generated with `openapi-typescript` + `openapi-fetch` from `openapi/grid-api.yaml` (you author a first-draft spec covering v1 endpoints)
- React Hook Form + Zod; Zod schemas in `lib/validation` shared by forms, BFF edge validation, and tests
- Auth: WebAuthn/passkeys via `@simplewebauthn/browser` + `@simplewebauthn/server`; TOTP fallback via `otplib`
- Charts: Recharts (or visx) — keyboard-navigable, reduced-motion, with a text equivalent
- Framer Motion, every animation guarded by `prefers-reduced-motion`
- next-intl (English only in v1, but zero hard-coded user-facing strings)
- Testing: Vitest + React Testing Library; Playwright + `@axe-core/playwright`; Storybook 8 + `addon-a11y`; MSW shared across tests/Storybook/dev
- Lighthouse CI with budgets
- Sentry with PII scrubbing; `web-vitals` reporting through the BFF
- ESLint (`typescript-eslint`, `eslint-plugin-jsx-a11y`, `eslint-plugin-security`, `eslint-plugin-no-secrets`), Prettier, Husky + lint-staged, commitlint, Knip

## REPO STRUCTURE

```
app/(marketing) · app/(auth) · app/(app)/{dashboard,onboarding,activity,security,settings} · app/api/{auth,bff/[...path]}
components/ui · components/patterns
lib/{api,auth,money,security,validation}
hooks · styles · test · e2e · stories · .github/workflows · openapi
```

## DESIGN SYSTEM (build first, in Storybook)

**Tokens** (`styles/tokens.css`, light + `[data-theme="dark"]`):
- `--paper #FAFAF8` / dark `#0C0C0D`; `--ink #0B0B0C` / dark `#F2F2EE`; warm grey ramp `--grey-100..900`
- one accent only: `--accent #1E3A2F` (deep green), `--accent-fg #FAFAF8`
- semantic (muted, never neon): `--positive #2F6B4F`, `--caution #8A6D1F`, `--critical #8A2F2F`
- `--focus` = accent, ring 2px + 2px offset, ALWAYS visible
- radius 6/10px; spacing base 8px; hairline `1px solid var(--grey-200)`
- type: headings serif (Source Serif 4 / Newsreader, self-hosted), UI/body sans (Inter / Geist, self-hosted), money & account numbers use tabular/mono figures
- type scale is restrained: app headings 1.25–1.5rem, marketing hero ≤2.5rem; body measure ~66ch; line-height generous

**Primitives** (`components/ui`, each with stories + all states): Button, IconButton, Link, Field (label/input/hint/error), TextInput, Select, Checkbox, RadioGroup, Switch, Dialog/Sheet, Toast, Tooltip, Tabs, Card/Panel, Table, Badge, Skeleton, Spinner, Avatar, DefinitionList, Callout, ProgressMeter, ThemeToggle.

**Patterns** (`components/patterns`): MoneyAmount, AccountRow, BalanceHeader, CashflowChart, ActivityList/ActivityItem, UpcomingList, StateView (loading/empty/error), StepIndicator, SessionRow, PasskeyPrompt, ConfirmDialog (with step-up hook), AppShell (nav + header + skip link).

## SECURITY IMPLEMENTATION (must all exist in v1)

- **Session:** opaque id cookie `httpOnly; Secure; SameSite=Strict; Path=/`; server-side session store (Redis interface, in-memory impl for dev) holding encrypted backend tokens; idle timeout 10 min, absolute 12 h; refresh rotation with reuse detection.
- **CSRF:** double-submit token on every mutating BFF route; also verify `Origin` / `Sec-Fetch-Site`.
- **CSP:** strict nonce-based via middleware — `default-src 'self'`, `script-src 'self' 'nonce-…'`, `style-src 'self' 'nonce-…'`, `img-src 'self' data:`, `connect-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'none'`. Trusted Types where supported. No `unsafe-inline`.
- **Headers** (middleware): HSTS w/ preload, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive `Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin`.
- **Edge validation:** every BFF route parses input with a Zod schema from `lib/validation` before doing anything.
- **Rate limiting:** per-IP + per-account on `app/api/auth/*`; sensible limits on other BFF routes. Pluggable store (in-memory dev, Redis prod).
- **Bot protection:** Cloudflare Turnstile on sign-up and sign-in (server-verified in the BFF).
- **Auth UX security:** generic errors (no user enumeration), account lockout after N failed attempts with cooldown, email verification required, passkey is primary factor, TOTP fallback.
- **Step-up auth:** `requireStepUp()` helper + `<ConfirmDialog>` integration; re-prompt for passkey/TOTP before changing security settings, disabling 2FA, or "sign out everywhere". Elevation is short-lived and single-purpose.
- **PII:** account numbers masked by default (`•••• 4291`), reveal on explicit click; `lib/security/redact.ts` strips PII + money + tokens; used by logger and Sentry `beforeSend`.
- **Money-movement seams** (feature is post-v1 but build the guards): allowlist + cooling-off + per-txn/daily limit types in `lib/validation`, an idempotency-key helper, and a canonical confirmation screen component.
- **Deps:** committed lockfile, Renovate config, `npm audit --audit-level=high` + Semgrep + CodeQL + secret-scan in CI (blocking on high). Self-host all fonts. No third-party runtime scripts except Turnstile (with SRI).
- **Threat model doc:** `docs/threat-model.md` — a STRIDE pass over auth, session, onboarding, dashboard; abuse cases listed beside the user stories.

## BFF / API ENDPOINTS (v1, author the OpenAPI spec for these)

Auth (`app/api/auth`): `POST /signup`, `POST /verify-email`, `POST /passkey/register/options`, `POST /passkey/register/verify`, `POST /passkey/auth/options`, `POST /passkey/auth/verify`, `POST /totp/setup`, `POST /totp/verify`, `POST /login` (fallback), `POST /logout`, `POST /step-up`, `GET /session`.

App (proxied via `app/api/bff/[...path]`): `GET /me`, `PATCH /me`, `GET /onboarding`, `POST /onboarding/kyc`, `GET /accounts`, `GET /accounts/:id`, `GET /dashboard/summary` (total position, cashflow in/out this month, upcoming), `GET /activity?limit=`, `GET /security/sessions`, `DELETE /security/sessions/:id`, `POST /security/sessions/revoke-all`, `GET /security/devices`, `POST /security/2fa/...`, `GET /notifications/preferences`, `PATCH /notifications/preferences`.

All responses typed; MSW handlers implement realistic data + latency + occasional error injection for testing.

## SCREENS TO BUILD (v1)

1. **`/` marketing landing** — hero (≤2.5rem), the three promises, a static teaser of the Future view, footer. SSG, Lighthouse ≥95 all categories, fully accessible.
2. **`/signup`** → email/passkey, Turnstile, → **`/verify-email`** → **`/onboarding`** (KYC stub: name, DOB, address, ID-upload placeholder; "under review" → mock auto-approve → account provisioned).
3. **`/signin`** — passkey primary, "use a code instead" (TOTP), remembered device, lockout state.
4. **`/dashboard`** — BalanceHeader (total position), account list, CashflowChart (in/out this month, with text equivalent), UpcomingList, ActivityList (last 10), quick-action buttons rendered **disabled** with "coming soon" affordance. All four states.
5. **`/activity`** — full paginated list, filters (date, direction), empty + error states.
6. **`/security`** — active sessions (revoke each), devices, "sign out everywhere" (step-up), 2FA management (step-up to disable), change password.
7. **`/settings`** — profile details (edit + validate), notification preferences, theme toggle.
8. **System:** AppShell with skip-link + keyboard nav, toast system, offline banner, `not-found.tsx`, `error.tsx` per segment, global 500, loading skeletons everywhere.

## TESTING (all wired into CI, all gating)

- `tsc --noEmit`; ESLint zero-warnings; Prettier check; Knip.
- Vitest unit: `lib/money` (incl. rounding/negatives), `lib/validation`, `lib/auth`, `lib/security/redact`, hooks.
- RTL component: every `ui/` + `patterns/` component across default/loading/empty/error/disabled.
- MSW contract tests: handlers type-checked against generated OpenAPI types.
- Playwright e2e: full onboarding; sign-in via passkey (virtual authenticator) and via TOTP; dashboard loads with data / empty / error; revoke a session; sign out everywhere (with step-up); theme persists.
- `@axe-core/playwright` on every route — zero serious/critical. Documented full keyboard pass.
- Playwright visual snapshots of key screens, light + dark.
- Lighthouse CI budgets: LCP < 2.0s, CLS < 0.05, TBT < 200ms, JS budget per route.
- Security: `npm audit`, Semgrep, CodeQL, secret scan — blocking on high.

## DEFINITION OF DONE (every PR)

types pass · lint clean · unit + component + relevant e2e tests · all four states · keyboard + screen-reader pass · axe clean · light + dark · responsive 360→1440 · Storybook stories added/updated · no new `npm audit` high · no PII/secret/money in logs · README + relevant `docs/` updated · conventional-commit messages · PR description notes trade-offs and security-relevant changes.

## DELIVERABLES / ORDER OF WORK

1. **M0 Foundation** — scaffold, tooling, CI pipeline, `styles/tokens.css`, `components/ui` primitives + Storybook, MSW setup, AppShell, middleware (CSP + headers), Sentry + redaction, `openapi/grid-api.yaml` draft, `docs/threat-model.md` skeleton.
2. **M1 Marketing** — landing page, brand applied, Lighthouse green.
3. **M2 Auth** — signup/verify/passkey/TOTP, BFF session store, CSRF, rate limiting, Turnstile, step-up, lockout — with e2e.
4. **M3 Onboarding** — KYC stub, provisioning, review/approve/reject states.
5. **M4 Dashboard** — summary, cashflow chart, activity, upcoming, all states.
6. **M5 Security centre + settings** — sessions/devices, sign-out-everywhere, 2FA management, profile, preferences, theme.
7. **M6 Harden** — full a11y sweep, complete e2e + visual suite, security scans passing, perf budgets, `README.md`, `docs/` finalised, deploy config (Vercel or container) with all env vars documented (none secret in `NEXT_PUBLIC_*`).

Produce each milestone as its own set of small PRs. After each milestone, post a short status: what shipped, test coverage, any deviations from this prompt and why.

## STARTING INSTRUCTION

Begin with **M0**. Before writing code, output: (a) the exact dependency list with versions, (b) the `tsconfig`/ESLint/Prettier config, (c) the token file, (d) the CI workflow, (e) the draft OpenAPI paths. Wait for confirmation, then build M0.
