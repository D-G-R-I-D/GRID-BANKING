# Contributing

Applies to everyone, including the owner.

## Branches

```
feature/*  →  dev  →  main
```

- `dev` is the default and where feature branches merge.
- `main` is the released version.
- Both are protected. No direct pushes.

Name working branches `type/short-description`: `feat/transfer-limits`,
`fix/dashboard-empty-state`, `chore/bump-next`, `docs/conventions`.

## Pull requests

Every PR into `dev` or `main`:

1. Passes CI — the `ci-ok` check (format, lint, typecheck, tests, build, e2e).
2. Gets **one approving review from @D-G-R-I-D**. Teammates cannot approve their
   own or each other's PRs into these branches; the owner is the code owner.
3. Has its review comments resolved.
4. Uses a [Conventional Commits](https://www.conventionalcommits.org) title
   (`feat(transfer): daily limit`) — it becomes the squash-merge message.

Merges are **squash only**. The branch is deleted on merge.

The owner merges their own PRs directly (GitHub blocks self-approval); everyone
else waits for the owner's review.

## Before you open a PR

```bash
npm run format
npm run lint
npm run typecheck
npm test
```

- All four UI states handled: loading, empty, error, done
- Keyboard works, inputs are labelled, focus is visible
- Looks right in light and dark
- No secrets, PII, or money values in logs

## Repo settings (already configured)

- Branch protection on `main` and `dev`: PR required, 1 code-owner approval,
  `ci-ok` required, linear history, no force-push, no deletion.
- Squash-merge only; head branches auto-deleted.
- Dependabot: monthly, grouped.
