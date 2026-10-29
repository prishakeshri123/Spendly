---
name: test-gate
description: Check that changed code has tests, run them, and report real results. Use before raising a PR.
disable-model-invocation: true
---

# Test gate

1. List changed source files: `git diff main...HEAD --name-only`.
2. For each changed `api/src/modules/*/*.service.ts` or route file, confirm a matching Vitest test exists and covers: the happy path, validation failure, another user's data (must be rejected or invisible), and money edge cases (integer minor units, zero, negative, rounding).
3. Write the missing tests, following the existing test style.
4. Run, per package that changed, and report the actual output summary:
   - `npm run build` (typecheck) in `api/`
   - `npm run lint` and `npm run build` in `web/`
   - `npm test` if the script exists
5. Report: tests added, commands run with pass/fail counts, and anything that could not be run and why. Never claim a pass you did not see.
