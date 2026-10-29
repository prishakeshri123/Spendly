---
name: start-issue
description: Start work on a GitHub issue. Reads the issue, explains the plan and which files/modules it will impact, implements after approval, then gives a recap of the changes before any PR is raised.
argument-hint: <issue number or URL>
disable-model-invocation: true
---

# Start Issue

Work on GitHub issue `$ARGUMENTS` for this repo. There are two approval gates: the plan, and the recap. Never skip either.

## 1. Read the issue

- Resolve owner/repo from `git remote get-url origin`.
- Fetch the issue with `mcp__github__issue_read` (load it via ToolSearch if deferred), including comments and labels. If `$ARGUMENTS` is empty, ask which issue.
- If the issue is unclear or conflicts with CLAUDE.md (money rules, `userId` filtering, build order), say so and ask before planning.

## 2. Explain the plan (gate 1: stop here)

Read the relevant code first (Grep/Read; use the Explore agent for broad sweeps). Then present:

- **Understanding**: the issue in one or two sentences.
- **Approach**: the steps you will take, in order.
- **Impact map**: a table of every file or module to create or change, with what changes and why. Cover where relevant: `api/prisma/schema.prisma` and migrations, `api/src/modules/*` (routes/schema/service), `api/src/plugins`, `api/src/utils`, `web/` pages and components, env vars, docs.
- **Ripple effects**: what else could break (existing endpoints, data, tests, UI), and any migration or data risk.
- **Rules check**: how CLAUDE.md rules apply (integer money, `userId` on every query, Zod validation, transactions for multi-step changes, no logging secrets).
- **Open questions** and the test plan.

**Stop and wait for the user to approve or adjust the plan.** Do not create a branch or edit files before that.

## 3. Implement

- From an up-to-date `main`, create a branch `feat/<issue-number>-<short-slug>` (use `fix/` for bugs). If already on a matching branch, keep it.
- Follow CLAUDE.md conventions and match surrounding code. Keep the change within the approved plan; if scope grows, stop and tell the user.
- Add or update tests (Vitest for services, Fastify `inject` for routes).
- Run the typecheck, lint and tests that exist (`npm run build`, `npm test` in `api/` and/or `web/`) and report real results.
- Commit in small, focused commits, each message referencing the issue (e.g. `Add X (#12)`). Do not push yet.

## 4. Recap before the PR (gate 2: stop here)

Gather the facts from `git diff main...HEAD --stat` and `git log main..HEAD --oneline`, then present:

- **What changed**: per file or module, in plain language.
- **How it maps to the plan**: done, deviated (and why), or deferred.
- **Verification**: commands run and their actual results; anything not run.
- **Risks and follow-ups**: migrations to apply, env changes, known gaps.
- **Draft PR**: title and description (summary, `Closes #<n>`, test plan). Check for a PR template (`.github/pull_request_template.md`) and follow it.

**Do not push or open the PR until the user explicitly approves.** On approval: push the branch, then create the PR with `mcp__github__create_pull_request` against `main`, and share the link.
