# Conventions

How the code is organised, so anyone can add a feature the same way.

## Architecture

It's a full-stack Next.js app, but it's layered like a conventional service.
If you know Spring, the mapping is:

| Spring | Here |
| --- | --- |
| `@RestController` | **Server Action** in an `actions.ts` next to the route — the request boundary: auth check, input validation, calls a service, returns a `FormState` |
| `@Service` | **`lib/services/*`** — business logic, orchestration, DB transactions. Returns **view models**, never Prisma rows |
| `@Repository` / JPA | **`lib/data/*`** — the only place Prisma is queried. One file per table |
| DTO / `@Valid` body | **Zod schema** in `lib/validation.ts`, shared by the form and the action |
| Entity | **Prisma model** in `prisma/schema.prisma` |
| View model / response DTO | **`lib/view.ts`** — the plain shapes the UI receives |

```
Client Component (form)
  → Server Action (actions.ts)      validate + auth
    → Service (lib/services)        rules, transaction, map → view model
      → Data (lib/data)             Prisma queries only
        → Prisma → PostgreSQL

Server Component (page)
  → Service (lib/services)          returns a view model
    → Data (lib/data) → Prisma
```

**Rule: a React component never imports `@prisma/client` or `lib/db`.** It
receives `lib/view.ts` types. Services do the mapping (`lib/services/mappers.ts`).

## Folders

```
app/
  page.tsx                 landing (public)
  (auth)/                  sign-up, sign-in — redirect to /dashboard if logged in
  (onboarding)/set-pin     signed in but no PIN yet — mandatory PIN setup
  (app)/                   behind auth + PIN; layout calls requireUserWithPin(); app shell + bottom nav
    dashboard/  transfer/  loans/  activity/  settings/ (settings/pin)
    actions.ts             shared server actions (sign out)
lib/
  db.ts                    Prisma client singleton
  data/                    repository layer — Prisma queries only
    users.ts  accounts.ts  transfers.ts  loans.ts
  services/                business logic — returns view models
    auth-service.ts  dashboard-service.ts  transfer-service.ts
    activity-service.ts  profile-service.ts  mappers.ts
    pin-service.ts           verifyTransactionPin (lockout), setInitialPin, changePin
    loan-service.ts          getLoans, applyForLoan, repayLoan
  view.ts                  view-model types (AccountView, ActivityView, ReceiptView, …)
  session.ts               iron-session: getSession, getCurrentUser, requireUser,
                           requireUserWithPin
  session-config.ts        cookie options + SessionData — Prisma-free (edge proxy imports it)
  session-policy.ts        pure: checkExpiry (idle/absolute) — unit tested
  pin.ts  loan.ts          pure PIN policy + loan maths (client-safe) — unit tested
  validation.ts            Zod schemas
  auth.ts                  password hash/verify
  money.ts  phone.ts  reference.ts   pure helpers (unit tested)
  name.ts  cn.ts  form.ts  date.ts (Lagos-time formatting)
components/
  ui/                      primitives: Button, Field, Card, PinInput, ChoiceGroup
  confirm-step.tsx         review + PIN screen before any money moves
  live-updates.tsx         router.refresh() every 15s while active + on tab return;
                           toasts new incoming money. Stops after 2 min idle so the
                           session idle timeout still works
  animated-money.tsx       <MoneyAmount> that counts to new values (use-count-up.ts)
  cashflow-card.tsx        weekly in/out chart; colours are --viz-in / --viz-out
                           (validated pair — don't swap for other hexes)
  network-badge.tsx        MTN/Airtel/Glo/9mobile marks; set NETWORKS[].logo to use
                           an official file from public/networks/
  use-pin-action.ts        useActionState wrapper for PIN-confirmed forms
  icons.tsx                inline SVG icon set (no icon dependency)
  balance-card, quick-actions, account-strip, activity-feed, bottom-nav, app-header
  money-amount.tsx         the ONLY place money is rendered
hooks/  use-count-up.ts
prisma/  schema.prisma  seed.ts  migrations/
proxy.ts                   Next 16 edge convention (was middleware.ts) — anon redirect
```

## Rules

1. **Money is integer minor units** (kobo). Never a float. Render only via
   `<MoneyAmount>`. Math lives in `lib/money.ts` with a test.
2. **Account number = last 10 digits of the user's phone** (`lib/phone.ts`),
   set at sign-up, unique. Shown masked.
3. **Mutations are Server Actions** → validate with a Zod schema → call a
   service → `revalidatePath` → return `FormState`.
4. **Reads are Server Components** → call a service → render a view model.
5. **Components never touch Prisma.** Services map rows → `lib/view.ts` shapes.
6. Gating: `(app)/layout.tsx` calls `requireUser()`. In an action use
   `getCurrentUser()` and return an error (don't redirect from an action).
6a. **Sensitive actions** (moving money, loans) need the transaction PIN on
   every submit: the schema takes `pin`, the action calls
   `verifyTransactionPin(userId, pin)` and returns `fieldErrors.pin` on failure.
   The UI uses `<ConfirmStep>` + `usePinAction`. The password is only for
   signing in — and for changing/resetting the PIN.
7. No `any`, no `dangerouslySetInnerHTML` (ESLint errors).
8. Styling: token classes only (`bg-surface`, `text-ink-soft`, `border-line`,
   `text-accent`, `bg-card`…). Tokens in `app/globals.css`. No raw hex.
9. Every screen: loading / empty / error / done. Keyboard + labels + focus.
   Light and dark. `prefers-reduced-motion` respected.

## Adding a feature — "close an account"

1. `AccountView` already exists; add any new view type to `lib/view.ts`
2. `lib/data/accounts.ts` → `deactivateAccount(id)`
3. `lib/services/account-service.ts` → `closeAccount(userId, accountId)` with the rules
4. `app/(app)/accounts/actions.ts` → `closeAccountAction` (validate + call service)
5. Client form via `useActionState`; Server Component page renders it
6. Unit-test the service's rules; add a Playwright case if it's a key flow
7. PR into `dev`
