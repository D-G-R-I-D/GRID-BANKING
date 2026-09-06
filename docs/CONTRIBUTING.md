# Contributing to GRID Banking FE

These rules apply to **everyone, including the maintainer and any AI agents.**
No one pushes to a protected branch directly; everything goes through a PR that
is reviewed and green.

---

## 1. Branching model

Three long-lived branches, promoted in one direction only:

```
feature/*  ─PR→  dev  ─PR→  staging  ─PR→  main (production)
```

| Branch    | Purpose                          | Deploys to      | Who merges |
| --------- | -------------------------------- | --------------- | ---------- |
| `main`    | Production. Tagged releases.     | production env  | maintainer |
| `staging` | Release candidate / QA           | staging env     | maintainer |
| `dev`     | Integration. **Default branch.** | dev/preview env | maintainer |

> `main` is the production branch (kept as the default name to avoid the churn
> of renaming a default branch mid-project). If you prefer it literally called
> `prod`, that's a one-time rename — ask the maintainer.

### Working branches — branch off `dev`

Name them `type/short-description`, kebab-case. Optionally prefix an issue number.

```
feat/passkey-signin
fix/dashboard-empty-state
chore/eslint-config
docs/threat-model
feat/GRID-42-cashflow-chart
```

Allowed types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`, `build`.

Keep them **short-lived** (ideally < 3 days). Rebase on `dev` rather than merging `dev` in.

### Hotfixes

Branch `fix/*` off `main`, PR back into `main`, then the maintainer opens
follow-up PRs to port the fix down into `staging` and `dev`.

---

## 2. Pull request rules (enforced by branch protection)

Every PR into `dev`, `staging`, or `main` must:

1. **Have 1 approving review** from a code owner (the maintainer). You cannot
   approve your own PR — the maintainer self-merges their own PRs using admin
   rights; everyone else waits for the maintainer's approval.
2. **Pass all required status checks** — the `ci-ok` gate (lint, typecheck,
   unit tests, build; later e2e) and the security checks.
3. **Be up to date with the base branch** before merging (CI re-runs on the
   merge result).
4. **Have all review conversations resolved.**
5. **Use a Conventional Commit title** (`feat(scope): …`). This becomes the
   squash-merge commit message.
6. **Have a linear history** — merges are **squash only**. No merge commits,
   no force-pushes to protected branches, no branch deletion.
7. **Fill in the PR template**, including the *Security impact* section.

Stale approvals are dismissed automatically when new commits are pushed.

---

## 3. Commit conventions

[Conventional Commits](https://www.conventionalcommits.org/). Enforced locally
by commitlint (Husky hook) and on the PR title.

```
feat(dashboard): add cashflow chart
fix(auth): reject expired step-up tokens
chore(deps): bump next to 15.x
docs: expand threat model for onboarding
```

Breaking changes: add `!` (`feat(api)!: …`) and a `BREAKING CHANGE:` footer.

---

## 4. Definition of done

A change is not done until:

- `npm run typecheck` passes — strict TS, no `any`, no unjustified `@ts-ignore`
- `npm run lint` and `npm run format:check` are clean (zero warnings)
- Unit / component tests cover the change; `lib/` stays high-coverage
- All four states exist: **loading, empty, error, success** (+ disabled/permission)
- Keyboard-operable, visible focus, correct semantics; **axe: no serious/critical**
- Works in **light and dark**; responsive **360 → 1440**
- Storybook stories added/updated for `components/ui` and `components/patterns`
- **No PII, money values, tokens, or secrets** in logs, error reports, analytics, or URLs
- No new `npm audit` high/critical
- Docs / README updated if setup or behaviour changed

---

## 5. Security rules that never bend

- The browser holds **no** backend tokens and **no** third-party API keys.
  Session = opaque id in an `httpOnly; Secure; SameSite=Strict` cookie.
- **All** authenticated API calls and third-party calls go through the BFF
  (`app/api/**`). The client never calls the backend or a vendor directly.
- Money is **integer minor units**, never a float. Rendered only via `<MoneyAmount>`.
- `dangerouslySetInnerHTML` is banned (ESLint error).
- Secrets live in env / GitHub Environment secrets. Never in `NEXT_PUBLIC_*`,
  never committed. `.env.example` documents the names only.
- Money-moving or security-changing actions require step-up auth + explicit confirm.
- Any change touching auth, session, CSP/headers, PII, or the BFF must call it
  out in the PR's *Security impact* section and gets extra review scrutiny.

See `docs/threat-model.md` (created in M0) and `SECURITY.md`.

---

## 6. Local setup (after the M0 scaffold lands)

```bash
npm ci
cp .env.example .env.local   # fill in local values
npm run dev
```

Useful scripts (defined in M0): `dev`, `build`, `start`, `lint`, `format`,
`format:check`, `typecheck`, `test`, `test:ci`, `test:e2e`, `storybook`,
`api:generate` (regenerate the typed client from `openapi/grid-api.yaml`).

---

## 7. Repository settings checklist (one-time, maintainer)

Run `scripts/setup-branch-protection.sh` after `gh auth login`. It configures
branch protection for `main`, `staging`, `dev`. Then in repo **Settings**:

- **General → Pull Requests:** allow **squash merge only**; "Default to PR title";
  **auto-delete head branches**; allow auto-merge.
- **General:** disable Wiki if unused; keep Issues on.
- **Branches:** default branch = `dev`.
- **Environments:** create `dev`, `staging`, `production`; add the maintainer as a
  **required reviewer** on `production`; scope deploy secrets per environment.
- **Code security:** enable Dependabot alerts + security updates, secret scanning,
  and **push protection**.
- **Actions → General:** workflow permissions = **read-only** by default;
  require approval for first-time contributors.
- **Rulesets (optional, stricter):** you can move the branch rules to a
  repo Ruleset and add "require signed commits" once everyone has commit signing set up.
