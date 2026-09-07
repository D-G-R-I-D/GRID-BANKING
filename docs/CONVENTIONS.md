# Conventions

How the code is laid out, so anyone on the team can add a feature the same way.

## Folders

```
app/
  page.tsx              landing (public)
  (auth)/               sign-up, sign-in — redirects to /dashboard if logged in
  (app)/                everything behind auth; layout calls requireUser()
    dashboard/
    transfer/
    actions.ts          shared server actions (sign out)
  error.tsx, not-found.tsx
components/
  ui/                   dumb primitives: Button, Field, Card
  money-amount.tsx      the ONLY place money is rendered
  app-header.tsx
lib/
  db.ts                 Prisma client singleton
  session.ts            iron-session: getSession, getCurrentUser, requireUser
  auth.ts               hashPassword / verifyPassword
  money.ts              minor-unit formatting + parsing  (unit tested)
  validation.ts         Zod schemas, shared by forms and server actions
  accounts.ts           account provisioning + queries
  transfers.ts          createTransfer — the money-movement transaction
  form.ts               FormState type + Zod error helper
prisma/
  schema.prisma         data model
  seed.ts               demo user
proxy.ts                coarse redirect for anon users hitting /dashboard
```

## Rules

1. **Money is integer minor units** (kobo). Never a float. Render only through
   `<MoneyAmount>`. Any math goes in `lib/money.ts` with a test.
2. **Mutations are Server Actions** in an `actions.ts` next to the route. They:
   re-validate input with a Zod schema from `lib/validation.ts`, do the work,
   `revalidatePath` what changed, and return a `FormState`.
3. **Reads are Server Components.** Fetch with a helper from `lib/`, pass plain
   data to Client Components. Don't fetch in the browser.
4. **Gating:** `(app)/layout.tsx` calls `requireUser()`. Inside an action use
   `getCurrentUser()` and return an error (don't redirect from an action).
5. **Forms** are Client Components using `useActionState(action, {})`. Show
   `state.fieldErrors?.x` under fields and `state.error` / `state.success` as an
   alert / status.
6. **Styling:** Tailwind classes using the token colours (`bg-surface`,
   `text-ink-soft`, `border-line`, `text-accent`…). Tokens live in
   `app/globals.css`. No raw hex in components.
7. **No `any`. No `dangerouslySetInnerHTML`.** ESLint will fail the build.

## Adding a feature (example: "close an account")

1. Zod schema in `lib/validation.ts`
2. `app/(app)/accounts/actions.ts` → `closeAccountAction(prev, formData)`
3. Query/mutation helper in `lib/accounts.ts`
4. Client form component using `useActionState`
5. Server Component page that loads data and renders the form
6. Test the helper in `lib/`; add a Playwright case if it's a key flow
7. PR into `dev`
