# GRID Banking — Project Plan (v1)

> A futuristic bank for people who take tomorrow seriously.
> Not louder than a bank — *clearer* than one.

---

## 1. Product vision

**One line:** GRID shows you the future consequences of today's money, with the calm precision of a well-made instrument.

**Who it's for:** young, ambitious people (roughly 18–35) who are underserved by both the playful neobanks (feels like a toy) and the legacy banks (feels like a tax return). They want to feel in control of a long game.

**What makes it different (the three promises):**

| Promise | How the product proves it |
| --- | --- |
| **A good today** | Radical clarity: every number is explained, nothing is buried, no dark patterns, instant feedback. |
| **A good tomorrow** | Time-aware money: scheduled money, safe money-movement (allowlists, cooling-off), spending you can actually see. |
| **A good future** | The *Future view*: simulate "what if I save X / spend Y" and watch the projection move. Goals you can touch. |

**Brand personality:** mature, classical, trustworthy, quiet. Closer to a modern private bank or to Mercury/Stripe than to Monzo/Revolut. It should feel like software a 40-year-old CFO *and* a 22-year-old founder both respect.

---

## 2. Design direction

You picked **minimal / editorial / mature**, and pushed back on "big typography." You're right — here's the calibration:

- "Editorial" does **not** mean huge display type. It means a **clear, restrained hierarchy** and confidence to leave white space. We dial the display sizes *down*: marketing hero ~2.5rem max, in-app headings 1.25–1.5rem. The impact comes from spacing and precision, not size.
- **Near-monochrome.** Warm off-white "paper", near-black "ink", a full grey ramp. Exactly **one** low-saturation accent (deep green or ink-blue) used only for primary actions and focus rings. Semantic colours (positive / caution / critical) are muted, never neon.
- **Type:** a refined transitional **serif for headings** (classic, institutional — e.g. Source Serif 4 / Newsreader), a clean **sans for UI/body** (e.g. Inter / Geist), and **tabular / monospaced figures** for all money and account numbers (this is the one "engineered" tell). Body measure ~66ch, generous line-height.
- **Motion:** small, physical, purposeful. Number transitions, gentle reveals. Fully `prefers-reduced-motion` aware.
- **Grid & density:** 8px spacing base, comfortable density, strong left alignment, hairline rules instead of heavy cards where possible.
- **Dark and light** both first-class, defined as token swaps.

### Design tokens (starting point)

```
--paper:        #FAFAF8   (light bg)      --ink:          #0B0B0C   (light fg)
--paper-dark:   #0C0C0D   (dark bg)       --ink-dark:     #F2F2EE   (dark fg)
--grey-100..900: warm neutral ramp
--accent:       #1E3A2F   (deep green)    --accent-fg:    #FAFAF8
--positive:     #2F6B4F   --caution:      #8A6D1F   --critical:   #8A2F2F
--focus:        #1E3A2F   (2px ring, 2px offset, always visible)
--radius:       6px (sm) / 10px (md)      --hairline:    1px solid var(--grey-200)
```

---

## 3. Architecture

```
┌────────────┐    HTTPS + httpOnly cookie     ┌─────────────────────┐   short-lived token   ┌────────────────┐
│  Browser   │ ─────────────────────────────▶ │  Next.js App + BFF  │ ───────────────────▶ │  Spring Boot   │
│  (React)   │ ◀───────────── JSON ────────── │  (route handlers)   │ ◀─────────────────── │  API + ledger  │
└────────────┘                                └─────────────────────┘                       └────────────────┘
                                                       │                                            │
                                              3rd-party keys never                          PostgreSQL, double-entry
                                              reach the browser                             ledger, outbox
```

**Frontend:** Next.js 15 (App Router), React 19, TypeScript (strict). Marketing pages SSR/SSG; the authenticated app is a route group behind an auth guard.

**BFF (Next.js route handlers) owns:**
- The browser **session** — an opaque session id in an `httpOnly; Secure; SameSite=Strict` cookie. The backend access/refresh tokens live **only** server-side (encrypted session store, e.g. Redis).
- **Proxying** every API call and every third-party call (card processor, KYC vendor, bot-protection). The browser never holds a vendor API key.
- **CSRF** protection (double-submit token) on all mutating routes.
- **Edge validation** with shared Zod schemas before anything is forwarded.
- **Rate limiting** and **bot protection** (Cloudflare Turnstile) on auth + money routes, on top of the backend's own limits.
- **CSP nonce** injection and security headers.
- **Audit logging** of security events (login, step-up, session revoke, payee added).

**Backend:** Java 21 + Spring Boot 3, Spring Security, PostgreSQL, Flyway. Hexagonal architecture. **Money is stored as integer minor units — never floating point.** Double-entry ledger. Idempotency keys on every write. OpenAPI 3 spec is the contract; the FE generates its typed client from it.

> Backend is a separate repo/service. This repo is FE + BFF only. It develops against the OpenAPI spec with MSW mocks until the backend is live.

---

## 4. Frontend stack

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 15 App Router, React 19 | RSC for initial loads, route handlers for BFF |
| Language | TypeScript, `strict: true`, `noUncheckedIndexedAccess` | no `any`; `unknown` + narrow |
| Styling | Tailwind CSS v4 + CSS-variable tokens | tokens are the source of truth; Tailwind maps to them |
| Primitives | Radix UI (headless) | we own the styled component layer in `components/ui` |
| Server state | TanStack Query v5 | plus RSC for first paint |
| API client | `openapi-typescript` + `openapi-fetch` generated from backend OpenAPI | fully typed, no hand-written fetch |
| Forms | React Hook Form + Zod | Zod schemas shared between form, BFF edge validation, and tests |
| Local UI state | Zustand (minimal) | only genuinely global UI state |
| Auth | WebAuthn / passkeys (`@simplewebauthn`), TOTP fallback | passkey is the primary factor |
| Charts | Recharts or visx | keyboard-navigable, reduced-motion, described in text |
| Motion | Framer Motion | every animation guarded by `prefers-reduced-motion` |
| Money / dates | `Intl.NumberFormat` / `Intl.DateTimeFormat`; integer minor units | a `MoneyAmount` component is the only way money renders |
| i18n | next-intl | English-only v1, but no hard-coded strings |
| Unit / component tests | Vitest + React Testing Library | |
| E2E + a11y | Playwright + `@axe-core/playwright` | axe on every key page, zero serious violations |
| Component workshop | Storybook 8 + `addon-a11y` | every `ui/` component has stories + states |
| API mocking | MSW | shared handlers for tests, Storybook, and local dev |
| Perf budget | Lighthouse CI | budgets enforced in CI |
| Errors | Sentry with PII scrubbing | `beforeSend` redacts; no money values, no PII |
| Lint / format | ESLint (`typescript-eslint`, `jsx-a11y`, `no-secrets`, `security`), Prettier | |
| Hooks | Husky + lint-staged + commitlint (conventional commits) | |
| Dead code | Knip | CI check |
| CI/CD | GitHub Actions → Vercel (or container) | see §7 |

---

## 5. Repo structure

```
grid-banking-fe/
├─ app/
│  ├─ (marketing)/            # public, SSG — landing that sells the vision
│  ├─ (auth)/                 # sign-up, sign-in, verify, passkey/TOTP flows
│  ├─ (app)/                  # authenticated; layout enforces auth guard
│  │  ├─ dashboard/
│  │  ├─ onboarding/          # KYC stub, account provisioning
│  │  ├─ activity/
│  │  ├─ security/            # sessions, devices, 2FA, sign-out-everywhere
│  │  └─ settings/
│  └─ api/
│     ├─ auth/                # login, logout, passkey register/verify, step-up
│     └─ bff/[...path]/       # authenticated proxy to Spring Boot
├─ components/
│  ├─ ui/                     # design-system primitives (Button, Field, Sheet…)
│  └─ patterns/               # MoneyAmount, AccountRow, CashflowChart, StateView…
├─ lib/
│  ├─ api/                    # generated client + typed wrappers + query keys
│  ├─ auth/                   # session, csrf, step-up, WebAuthn helpers
│  ├─ money/                  # minor-unit math, formatting
│  ├─ security/               # csp, headers, rate-limit, redaction
│  └─ validation/             # shared Zod schemas
├─ hooks/
├─ styles/                    # tokens.css, globals.css
├─ test/                      # setup, msw handlers, data factories
├─ e2e/
├─ stories/
└─ .github/workflows/
```

---

## 6. Security — the part that matters

### Principles
1. The browser is hostile territory. No secrets, no vendor keys, no long-lived tokens in it — ever.
2. Every money-moving action is **confirmed, limited, reversible where possible, and logged**.
3. Least data. Don't fetch, store, log, or display PII/PAN you don't need.
4. Fail closed. An error in an auth or authz check denies access.

### Frontend / BFF controls

- **Token storage:** session id in `httpOnly; Secure; SameSite=Strict` cookie. Backend tokens in a server-side encrypted store keyed by session. **Nothing sensitive in `localStorage`/`sessionStorage`.**
- **CSRF:** double-submit token on all state-changing BFF routes; verify `Origin`/`Sec-Fetch-Site`.
- **CSP:** strict, nonce-based, `script-src 'self' 'nonce-…'`, no `unsafe-inline`, `frame-ancestors 'none'`, `object-src 'none'`. Adopt **Trusted Types** where supported.
- **Security headers:** HSTS (preload), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, tight `Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin`.
- **XSS:** rely on React escaping; **`dangerouslySetInnerHTML` is banned** (ESLint error). Sanitise any rich text server-side.
- **Session:** idle timeout (e.g. 10 min) + absolute timeout (e.g. 12 h); refresh-token rotation with reuse detection; "sign out everywhere"; list active sessions/devices with revoke.
- **Step-up auth:** re-prompt for passkey/TOTP before sensitive actions (add payee, raise a limit, change security settings). Short-lived elevation.
- **Money-movement abuse cases:** payee **allowlist**, **cooling-off** on new payees before large sends, per-transaction and daily **limits**, explicit confirmation screen showing amount + destination + fee, idempotency key per attempt, clear post-action receipt.
- **Card data (PCI):** stay in **SAQ-A** — card PAN/CVV entry and "reveal" happen **only** inside the processor's hosted iframe (e.g. Lithic/Marqeta/Stripe Issuing). We never receive, store, or log PAN/CVV. (Cards are post-v1, but the constraint is set now.)
- **PII handling:** mask account numbers by default (`•••• 4291`), reveal on explicit action. Redact PII and all monetary values from logs, error reports, analytics, and URLs.
- **Bot / abuse:** Turnstile on sign-up and sign-in; rate limits on auth (per-IP + per-account) and money routes; generic error messages (no user-enumeration).
- **Dependencies:** committed lockfile; Renovate/Dependabot; `npm audit --audit-level=high` gates CI; Semgrep + CodeQL in CI; self-host fonts (no third-party CDN); SRI on any unavoidable external script.
- **Client-side:** `rel="noopener noreferrer"` on external links; no secrets in `NEXT_PUBLIC_*`; no PII in query strings.
- **Accessibility as safety:** confirmations are unambiguous, destructive actions are clearly labelled, no pre-checked consent, no fake urgency.

### Threat model (do this properly)
Run a **STRIDE** pass per feature and keep abuse cases next to user stories. Priority assets: authentication, session, money movement, personal data. Priority attackers: credential-stuffer, account-takeover via social engineering, malicious insider, automated fraud rings.

### Compliance posture (aim, not v1 blockers)
Design toward: PCI-DSS SAQ-A, SOC 2 controls (audit logging, access control, change management), GDPR/data-protection (data minimisation, export, deletion, consent records), WCAG 2.2 AA, strong-customer-authentication style step-up.

---

## 7. Testing & quality strategy

| Layer | Tool | Gate |
| --- | --- | --- |
| Types | `tsc --noEmit` | must pass |
| Lint | ESLint + Prettier check | must pass, zero warnings |
| Unit | Vitest | money math, validation, auth helpers, hooks — high coverage on `lib/` |
| Component | Vitest + RTL | every `ui/` + `patterns/` component: default, loading, empty, error, disabled |
| Contract | MSW handlers typed against OpenAPI | mock responses can't drift from the schema |
| E2E | Playwright | onboarding, sign-in (passkey + TOTP), dashboard load, session revoke, sign-out |
| Accessibility | `@axe-core/playwright` + Storybook a11y | zero serious/critical violations on key pages; full keyboard pass |
| Visual | Playwright screenshots (or Chromatic) | key screens, light + dark |
| Performance | Lighthouse CI | LCP, CLS, TBT, bundle-size budgets |
| Security | `npm audit`, Semgrep, CodeQL, secret-scan | CI blocking on high severity |

**Definition of done for any feature:** types pass · lint clean · unit + component tests · all four states designed and built (loading / empty / error / success) · keyboard + screen-reader pass · axe clean · light + dark · responsive 360→1440 · Storybook stories · no new `npm audit` high · no PII/secret in logs · docs/README updated.

---

## 8. v1 scope — Onboarding + Auth + Dashboard

**In:**
1. **Marketing landing** — one page that communicates the three promises and the Future view idea. SSG, fast, accessible.
2. **Sign-up** — email + password *or* passkey creation, email verification, Turnstile.
3. **KYC stub** — name, DOB, address, ID-document upload placeholder; "under review" → auto-approve in mock; account provisioning on approval.
4. **Sign-in** — passkey primary, TOTP fallback; device remembered; generic errors; lockout after N failures.
5. **Dashboard** — total position, per-account balances, this-month cashflow (in / out), upcoming items, recent activity (last ~10), quick actions rendered as *disabled* placeholders for future features.
6. **Security centre** — active sessions + devices with revoke, "sign out everywhere", 2FA setup, change password.
7. **Settings / profile** — personal details, notification preferences, theme.
8. **System-wide** — loading skeletons, empty states, typed error states with recovery, offline banner, 404/500 pages, toast system, app shell with nav.

**Explicitly out of v1 (planned next):** real money movement, vaults/goals, virtual cards, insights, the interactive Future simulator. Build seams for them (disabled quick actions, nav slots), don't build them.

---

## 9. Milestones

| # | Milestone | Contents |
| --- | --- | --- |
| M0 | Foundation | repo, tooling, CI, design tokens, `ui/` primitives, Storybook, MSW, app shell, CSP/headers, error boundaries |
| M1 | Marketing | landing page, brand system applied, Lighthouse green |
| M2 | Auth | sign-up, verify, passkey + TOTP, session/BFF, CSRF, rate limiting, step-up |
| M3 | Onboarding | KYC stub, provisioning, review states |
| M4 | Dashboard | balances, cashflow chart, activity, upcoming, all states |
| M5 | Security centre + settings | sessions/devices, sign-out-everywhere, 2FA management, profile |
| M6 | Harden | full a11y pass, e2e suite, visual tests, security scan pass, perf budget, docs, deploy |
