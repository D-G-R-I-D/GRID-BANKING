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
  (app)/                   behind auth; layout calls requireUser(); app shell + bottom nav
    dashboard/  transfer/  activity/  settings/
    actions.ts             shared server actions (sign out)
lib/
  db.ts                    Prisma client singleton
  data/                    repository layer — Prisma queries only
    users.ts  accounts.ts  transfers.ts
  services/                business logic — returns view models
    auth-service.ts  dashboard-service.ts  transfer-service.ts
    activity-service.ts  profile-service.ts  mappers.ts
  view.ts                  view-model types (AccountView, ActivityView, …)
  session.ts               iron-session: getSession, getCurrentUser, requireUser
  validation.ts            Zod schemas
  auth.ts                  password hash/verify
  money.ts  phone.ts       pure helpers (unit tested)
  name.ts  cn.ts  form.ts
components/
  ui/                      primitives: Button, Field, Card
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
