# Progress

## Phase 0 — Scaffold

**Status:** DONE

- git init, branch: main
- All project files created (manifest, package.json, tsconfig, esbuild, vitest config)
- obsidian mock stubs in src/__mocks__/obsidian.ts
- smoke test passing; renderer + syncer stub tests (it.todo) in place
- src placeholder files created for all modules
- npm install, build, and test all pass
- First commit: chore: scaffold PocketSyncLite

## Phase 1 — Types, Constants, Settings Tab

**Status:** DONE

- src/constants.ts: 8 named exports (API base URL, folder defaults, filename template, timeout/retry constants)
- src/types.ts: PocketSettings interface, DEFAULT_SETTINGS, 7 domain interfaces matching Pocket API response structure
- src/settings.ts: PocketSyncLiteSettingsTab with 7 settings fields; re-exports DEFAULT_SETTINGS
- Build: clean (tsc + esbuild)
- Tests: 1 passed, 6 todo (no regressions)
- Commit: a365504 feat: types, constants, settings tab

## Phase 2 — TBD
