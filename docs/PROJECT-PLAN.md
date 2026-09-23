# GRID Banking — Project Plan

A student full-stack project: a small, believable "futuristic bank" that's
clearer than a real one. Built well enough to sit in a portfolio.

## Idea

GRID shows its working. Three promises:

- **A good today** — every number explained, no dark patterns.
- **A good tomorrow** — money that's easy and safe to move.
- **A good future** — see what today's choices do to next year (planned, not in v1).

Brand: mature, minimal, near-monochrome, one quiet green accent, serif
headings, tabular figures for money. Currency is **NGN** for now.

## Scope

### v1 (now)

- Landing page that states the idea
- Sign up → email + password, session cookie, two accounts provisioned (**Flow**, **Vault**)
- Sign in / sign out
- Dashboard — total position, per-account balances, recent activity
- Move money — transfer between your own accounts, with balance checks and
  idempotency so a double-click can't double-send
- **Transaction PIN** — 4 or 6 digits, set right after sign-up (mandatory; the
  app won't open without one). The password signs you in; the PIN authorises
  every transfer, loan and repayment. 5 wrong tries lock it for 15 minutes.
  Change it (or reset a forgotten one) from Profile with your password.
- **Loans** — borrow ₦5,000–₦500,000 over 1, 3, 6 or 12 months at a flat 2.5%
  a month. Repay monthly or all at once at the end; pay the next installment,
  what's overdue, the whole balance, or any amount, at any time. One active
  loan at a time.
- Every screen: loading, empty, error, and done states
- Accessible (keyboard, focus, labels), light + dark

### Later (not now, but the code leaves room)

- Scheduled / recurring transfers, external payees with an allowlist
- Loans: automatic debit on the due date, late fees, a credit limit that
  grows with repayment history
- Passkeys and 2FA (currently email + password only)
- Spending insights and the "future" projection
- KYC, real onboarding

## Architecture

```
Browser (React)  ──►  Next.js  ──►  Prisma  ──►  PostgreSQL
                      • pages (Server + Client Components)
                      • Server Actions = the API (auth, transfers)
                      • session cookie (httpOnly), never exposes tokens
```

One repo, one language, one deploy. No separate backend service.

## Data model (`prisma/schema.prisma`)

- **User** — email, name, passwordHash
- **Account** — belongs to a user, `kind` FLOW | VAULT, `balanceMinor` (integer
  kobo), `currency`
- **Transfer** — from/to account, `amountMinor`, `idempotencyKey` (unique),
  optional note
- **Loan** — principal, flat interest, total, `repaidMinor`, term, plan
  (INSTALLMENTS | SINGLE), status; **LoanInstallment** (due date, amount, paid);
  **LoanRepayment** (links a repayment to its transfer)

Loan money moves as ordinary transfers between the borrower's Flow account and
GRID's **lending house account** (`acct_grid_lending`, owned by a system user
that can't sign in or be paid; created by the `pin_and_loans` migration). So
disbursements and repayments show up in activity and have receipts for free.

Money is **always integer minor units**. Balances are updated together with the
transfer row inside one DB transaction.

## Security (right-sized for a student project)

- Session id in an `httpOnly; SameSite=Lax; Secure`-in-prod cookie; no tokens in
  the browser, nothing sensitive in `localStorage`
- Passwords and PINs hashed with bcrypt (cost 12). A 4-digit PIN is only
  10,000 combinations, so the lockout is the real defence: attempts are counted
  atomically *before* the compare, so parallel guesses can't beat the limit
- Server Actions get Next's built-in same-origin check; all input re-validated
  with Zod on the server
- Generic auth errors (no "which emails exist"), similar timing on sign-in
- Security headers + a strict-ish default in `next.config.ts`
- `react/no-danger` and `no-explicit-any` are ESLint errors
- No PII or money values in logs / error reports
- `npm audit --audit-level=high` runs in CI

## Testing

| Kind | Tool | Covers |
| --- | --- | --- |
| unit | Vitest | `lib/money`, `lib/validation` |
| component | Vitest + Testing Library | `MoneyAmount`, form fields |
| e2e | Playwright | sign-up → dashboard, protected-route redirect |

CI (`.github/workflows/ci.yml`) runs format, lint, typecheck, tests, build, and
e2e against a Postgres service. The `ci-ok` job is the single required check.

## Milestones

| # | What |
| --- | --- |
| M0 | Scaffold, tokens, UI primitives, DB, auth, dashboard, transfer, CI ← **this PR** |
| M1 | Polish: all empty/error states, a11y sweep, more tests, deploy to Vercel + Neon |
| M2 | Scheduled transfers + external payees |
| M3 | Insights + the "future" view |
