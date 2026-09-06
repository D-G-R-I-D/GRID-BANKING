#!/usr/bin/env bash
#
# One-time repo hardening for GRID Banking FE.
#
#   Prereq:  gh auth login   (needs 'repo' + 'admin:repo' scope)
#
#   Usage:
#     scripts/setup-branch-protection.sh            # reviews + hygiene rules
#     scripts/setup-branch-protection.sh with-ci    # also require CI status checks
#                                                   # (run this after the M0 scaffold merges)
#
# Safe to re-run. Applies the same protection to main, staging, and dev.

set -euo pipefail

WITH_CI="${1:-}"
REPO="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
BRANCHES=(main staging dev)

echo "Repository : $REPO"
echo "Branches   : ${BRANCHES[*]}"
echo "CI checks  : $([ "$WITH_CI" = "with-ci" ] && echo "REQUIRED" || echo "not yet (pass 'with-ci' later)")"
read -r -p "Proceed? [y/N] " ok; [ "$ok" = "y" ] || { echo "aborted"; exit 1; }

# --- required status checks -------------------------------------------------
if [ "$WITH_CI" = "with-ci" ]; then
  STATUS_CHECKS='{"strict":true,"checks":[{"context":"ci-ok"},{"context":"audit"},{"context":"secret-scan"}]}'
else
  STATUS_CHECKS='null'
fi

# --- apply protection to each branch --------------------------------------
for b in "${BRANCHES[@]}"; do
  echo "→ protecting $b"
  gh api -X PUT "repos/$REPO/branches/$b/protection" \
    -H "Accept: application/vnd.github+json" \
    --input - >/dev/null <<JSON
{
  "required_status_checks": $STATUS_CHECKS,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1,
    "require_last_push_approval": true
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true,
  "block_creations": false,
  "lock_branch": false,
  "allow_fork_syncing": false
}
JSON
done

# enforce_admins:false is deliberate — it lets the solo maintainer merge their
# own PRs (GitHub forbids self-approval). Flip it to true on main once a second
# maintainer exists:  gh api -X POST repos/$REPO/branches/main/protection/enforce_admins

# --- repo-level settings --------------------------------------------------
echo "→ default branch = dev"
gh api -X PATCH "repos/$REPO" -f default_branch='dev' >/dev/null

echo "→ merge settings (squash only, auto-delete branches, auto-merge on)"
gh api -X PATCH "repos/$REPO" \
  -F allow_squash_merge=true \
  -F allow_merge_commit=false \
  -F allow_rebase_merge=false \
  -F delete_branch_on_merge=true \
  -F allow_auto_merge=true \
  -F squash_merge_commit_title=PR_TITLE \
  -F squash_merge_commit_message=PR_BODY >/dev/null

echo "→ Dependabot alerts + automated security fixes"
gh api -X PUT "repos/$REPO/vulnerability-alerts" >/dev/null || true
gh api -X PUT "repos/$REPO/automated-security-fixes" >/dev/null || true

cat <<'DONE'

Done. Still to do by hand in the GitHub UI (no stable API):
  • Settings → Code security → enable Secret scanning + Push protection
  • Settings → Actions → General → Workflow permissions = read-only
  • Settings → Environments → create dev / staging / production,
    add yourself as a required reviewer on "production"
  • Delete the old default-branch pointer if anything still references main as default
DONE
