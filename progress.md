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

## Phase 2 — Pocket API Layer

**Status:** DONE

- src/pocket/api.ts: copied from PocketSync; constructor param changed to `{ apiKey: string; verboseSyncLogging?: boolean }`; `PocketSyncSettings` import removed
- src/pocket/mappers.ts: copied from PocketSync; stripped `isInsightRecording`, `matchesTagFilters`, `parseCommaSeparatedList`, `settings` param; hardcoded `kind: 'conversation'`; added summarization warn
- src/constants.ts: added `DEFAULT_REQUEST_TIMEOUT_MS`, `DEFAULT_RETRY_COUNT`, `DEFAULT_RETRY_DELAY_MS`, `MAX_PAGE_SIZE` aliases (unstaged)
- src/types.ts: expanded all domain interfaces to match mapper output shapes; added `PocketActionItem`, `PocketActionItemSubtask` (unstaged)
- Build: clean (tsc + esbuild, 0 errors)
- Tests: 1 passed, 6 todo (no regressions)
- Commit: 20d521d feat: copy and adapt Pocket API layer

## Phase 3 — Renderer

**Status:** DONE

- src/renderer.ts: `resolveFilename` + `renderNote` — pure TypeScript, zero obsidian imports
- src/__tests__/renderer.test.ts: 14 tests across summary, transcript, frontmatter tags, resolveFilename
- src/types.ts: updated NormalizedPocketRecording (recordingAt: Date, title: string|null, optional fields), PocketTranscriptSegment (start→startTime), PocketSummary (actionItems: string[], optional fields), PocketTag (optional fields), PocketTranscript.metadata optional — unstaged
- src/pocket/mappers.ts: updated to produce new types (new Date(), startTime, actionItem titles) — unstaged
- Build: clean (tsc + esbuild, 0 errors)
- Tests: 15 passed, 3 todo (18 total)
- Commit: d1a4e95 feat: renderer with tags, source wikilink, filename resolution

## Phase 4 — Syncer

**Status:** DONE

- src/syncer.ts: replaced placeholder; exports `sync`, `resolveFolder`, `SyncResult`
- src/__tests__/syncer.test.ts: 7 tests replacing the 3 it.todo stubs
- API shape fixes applied vs. proposed plan:
  - `listAllRecordings` receives `{ startDate: string, endDate: string }` (ISO strings, not Date objects)
  - `normalizeRecordingDetail` requires second arg `fallback: PocketRecordingListItem`
  - Both `normalizeRecordingListItem` and `normalizeRecordingDetail` return nullable — null checked with continue
- Build: clean (tsc + esbuild, 0 errors)
- Tests: 22 passed (7 syncer + 14 renderer + 1 smoke)
- Commit: 223c6df feat: syncer with folder resolution and error isolation

## Phase 5 — Main Plugin Entry Point

**Status:** DONE

- src/main.ts: replaced placeholder; exports default `PocketSyncLitePlugin` extending `Plugin`
- `onload`: loads settings, registers settings tab, registers `sync-pocket-recordings` command
- `runSync`: guards on empty API key, calls `sync()`, updates `lastSyncAt`, gates notification on `showSyncNotification`, logs errors to console
- `DEFAULT_SETTINGS` already exported from src/types.ts — no changes needed
- Build: clean (tsc + esbuild, 0 errors)
- Tests: 22 passed (no regressions; no new unit tests — wiring only)
- eval/new Function grep: PASS
- Commit: 2ff126a feat: main plugin lifecycle, sync command, notification gating
