# Security policy

## Reporting a vulnerability

Do **not** open a public issue for security problems.

Report privately via GitHub's **"Report a vulnerability"** button under the
repository's **Security** tab (Private vulnerability reporting), or email
the maintainer.

Please include: a description, steps to reproduce, affected area, and impact.
Do not include real personal or financial data in your report.

We aim to acknowledge within 3 working days and to agree a fix timeline
based on severity.

## Scope

This is a portfolio project and not a live financial service. Still, we treat
the following as in-scope and take them seriously:

- Authentication / session handling (passkeys, TOTP, cookies, CSRF, step-up)
- The BFF proxy layer and any secret/token exposure to the browser
- Content Security Policy and security-header regressions
- PII handling, logging, and redaction
- Dependency and supply-chain issues

## Out of scope

- Findings that require a compromised device or browser
- Social-engineering of maintainers
- Automated scanner output without a demonstrated impact
