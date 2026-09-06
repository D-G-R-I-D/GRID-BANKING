<!-- Title must follow Conventional Commits, e.g. "feat(dashboard): cashflow chart" -->

## What & why

<!-- What does this change and why. Link the issue: Closes #123 -->

## Target branch

<!-- feature PRs -> dev  |  release PRs dev -> staging  |  staging -> main -->

- [ ] This PR targets the correct branch

## Screenshots / recordings

<!-- UI changes: before/after, light + dark. Delete if N/A. -->

## Definition of done

- [ ] `npm run typecheck` passes, no new `any`
- [ ] `npm run lint` + `format:check` clean
- [ ] Unit / component tests added or updated
- [ ] All four states handled: loading, empty, error, success
- [ ] Keyboard + screen-reader pass; axe shows no serious/critical
- [ ] Works in light and dark; responsive 360→1440
- [ ] Storybook stories added/updated (for `ui/` and `patterns/`)
- [ ] No PII, money values, tokens, or secrets in logs / errors / URLs
- [ ] No new `npm audit` high/critical
- [ ] Docs / README updated if behaviour or setup changed

## Security impact

<!-- Auth, session, money movement, PII, third-party calls, headers/CSP?
     Describe the change and how it stays safe. "None" is a valid answer. -->

## Notes for the reviewer

<!-- Trade-offs made, follow-ups deferred, anything to look at closely. -->
