# Changelog

This file records user-visible changes, important development workflow changes, and unresolved follow-ups. Detailed implementation retrospectives belong under `docs/` only when explicitly requested.

## Unreleased

### Changed

- Development tooling now coordinates around one shared hot-reloading server and provides a direct verification launcher when pnpm cannot start repository scripts.
  - Problem: duplicate wrappers can hot-reload the same checkout and mutate the same development state.
- The dev wrapper launches the installed local Vinxi binary and attaches failure handling before asynchronous startup work, so direct invocation fails cleanly and does not strand server ownership state.
- Dev-server manifest writes use unique temporary files so overlapping updates do not collide.
- Routine work records a concise changelog entry; full implementation retrospectives are opt-in.
- Contributor guidance now includes dirty-worktree safeguards, an early file-extraction checkpoint, and selective manual browser verification.

### Verification

- `node app/scripts/verify.mjs` passed TypeScript, 7 Vitest tests, and ESLint with 15 pre-existing warnings.
- `pnpm -C app verify` reproduced a silent pnpm-launcher stall and was stopped before the repository script emitted output.
- Starting `node app/scripts/dev-server.mjs` twice reused the running server at `http://localhost:3000`; stopping the owner cleared both the advertised URL and lock directory.
- The updated post-work skill passed its structural validator, and `git diff --check` passed.

### Follow-ups

- None currently.
