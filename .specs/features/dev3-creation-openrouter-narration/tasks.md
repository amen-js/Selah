# Creation OpenRouter Narration Tasks

**Design**: `.specs/features/dev3-creation-openrouter-narration/design.md`
**Status**: Done
**Baseline**: 274 tests across 58 files; 0 failures and 0 skipped.

## Execution Plan

The catalogue and inactivity detector are independent foundations. Their chains
can advance in parallel until the DOM overlay integration joins them.

```text
T1 -> T2 -> T3 -> T8 --\
  \-----------> T9 ----+-> T10 -> T7 --\
T4 -> T5 -> T6 --------/          \-----+-> T12
                                  T11 --/
```

## Task Breakdown

### T1: Add the approved Creation narration catalogue [P]

**Status**: Complete

**What**: Add the 27 allowlisted narration IDs, three localized scripts and a
strict resolver shared by browser and server.
**Where**: `src/content/creationNarrations.ts`,
`src/content/creationNarrations.test.ts`
**Depends on**: None
**Reuses**: `MomentoCriacaoId`, `Idioma`, and the approved scripts in `docs/GDD.md`
**Requirements**: CNARR-01, CNARR-02, CNARR-03
**Tools**: local filesystem/shell; `tlc-spec-driven`
**Tests**: Unit
**Gate**: Quick

**Done when**:

- [x] Exactly 27 IDs cover initial, support and transition phases for all nine moments.
- [x] Every ID resolves non-empty pt-BR, en-US and es-ES copy.
- [x] Unknown IDs and languages resolve to `undefined`.
- [x] The targeted catalogue test passes without skipped tests.

**Commit**: `feat(content): add approved Creation narration catalogue`

### T2: Expose the protected guide narration endpoint

**Status**: Complete

**What**: Add `POST /api/tts/narracao` with strict allowlist validation, shared
rate budget, timeout and no-store MP3 response.
**Where**: `server/app.ts`, `server/app.test.ts`
**Depends on**: T1
**Reuses**: `/api/tts`, `OpenRouterTtsClient`, and the existing TTS limiter
**Requirements**: CNARR-02, CNARR-07
**Tools**: local filesystem/shell; `tlc-spec-driven`
**Tests**: Integration
**Gate**: Full

**Done when**:

- [x] Only `{ narracaoId, idioma }` is accepted and resolved server-side.
- [x] Invalid IDs, languages and extra fields fail before OpenRouter is called.
- [x] Scripture and guide speech share the ten-per-minute/IP budget.
- [x] Success, timeout, adapter failure and no-store MP3 behavior are tested.
- [x] The full test gate passes without skipped or deleted tests.

**Commit**: `feat(api): add protected Creation narration endpoint`

### T3: Extend the TTS controller for approved narration

**Status**: Complete

**What**: Add `narrar` to the controller while reusing its single-operation
neural playback, cancellation, cleanup and local speech fallback.
**Where**: `src/services/tts.ts`, `src/services/tts.test.ts`
**Depends on**: T1, T2
**Reuses**: Existing scripture TTS state machine and audio resource lifecycle
**Requirements**: CNARR-02, CNARR-03, CNARR-04
**Tools**: local filesystem/shell; `tlc-spec-driven`
**Tests**: Unit
**Gate**: Quick

**Done when**:

- [x] Neural requests send only narration ID and language.
- [x] Local fallback speaks the exact approved localized text.
- [x] New narration cancels stale scripture/guide requests and releases audio.
- [x] Existing `falar`, pause, resume and cancellation tests remain green.

**Commit**: `feat(tts): support approved Creation narration`

### T4: Add the pure Creation inactivity detector [P]

**Status**: Complete

**What**: Add a pure state helper that detects 12 seconds without meaningful
horizontal displacement and emits one transition per inactivity episode.
**Where**: `src/components/game/creation/progression/inatividade.ts`,
`src/components/game/creation/progression/inatividade.test.ts`
**Depends on**: None
**Reuses**: `PosicaoJogador`
**Requirements**: CNARR-06
**Tools**: local filesystem/shell; `tlc-spec-driven`
**Tests**: Unit
**Gate**: Quick

**Done when**:

- [x] The 11,999/12,000 ms boundary is deterministic.
- [x] Meaningful movement resets the timer and inactivity episode.
- [x] Jitter does not count as meaningful movement.
- [x] Disabled exploration resets without emitting support.

**Commit**: `feat(creation): detect exploration inactivity`

### T5: Emit inactivity from the Creation runtime

**Status**: Complete

**What**: Wire the pure detector into the existing R3F frame loop and expose
only boolean state transitions.
**Where**: `src/components/game/creation/progression/ProgressaoCriacaoRuntime.tsx`
**Depends on**: T4
**Reuses**: Existing player-position frame loop and moment lifecycle
**Requirements**: CNARR-04, CNARR-06
**Tools**: local filesystem/shell; `tlc-spec-driven`
**Tests**: Build
**Gate**: Build

**Done when**:

- [x] Runtime emits `true` once after inactivity and `false` once after resumed movement.
- [x] Disabled exploration and moment changes reset inactivity.
- [x] No per-frame React state updates are introduced.
- [x] Lint, all tests and production build pass.

**Commit**: `feat(creation): emit guide inactivity transitions`

### T6: Forward the Canvas inactivity contract

**Status**: Complete

**What**: Forward Creation inactivity from `World` through `GameCanvas` and
clear it outside the Creation region.
**Where**: `src/components/game/GameCanvas.tsx`
**Depends on**: T5
**Reuses**: Existing `onProgressaoCriacaoChange` callback pattern
**Requirements**: CNARR-04, CNARR-06
**Tools**: local filesystem/shell; `tlc-spec-driven`
**Tests**: Build
**Gate**: Build

**Done when**:

- [x] `GameCanvas` exposes `onInatividadeCriacaoChange` as an optional callback.
- [x] Creation forwards runtime transitions and other regions clear the signal.
- [x] Existing public props remain backward compatible.
- [x] Lint, all tests and production build pass.

**Commit**: `feat(game): forward Creation inactivity state`

### T7: Connect transient inactivity state in App

**Status**: Complete

**What**: Keep the inactivity boolean transient in `App` and pass it to the
production overlay without adding Zustand or persistence state.
**Where**: `src/App.tsx`, `src/App.test.tsx`
**Depends on**: T6, T10
**Reuses**: Existing transient Creation snapshot bridge
**Requirements**: CNARR-04, CNARR-06
**Tools**: local filesystem/shell; `tlc-spec-driven`
**Tests**: Integration (RTL)
**Gate**: Full

**Done when**:

- [x] App forwards Canvas inactivity changes to `GameOverlay`.
- [x] The signal clears when the snapshot leaves Creation.
- [x] No inactivity value enters local storage.
- [x] Full integration tests pass.

**Commit**: `feat(app): connect Creation guide activity state`

### T8: Add the Creation narration flow hook

**Status**: Complete

**What**: Implement initial, transition and once-per-episode support sequencing,
preference gating, Strict Mode deduplication and cancellation.
**Where**: `src/hooks/useCreationNarration.ts`,
`src/hooks/useCreationNarration.test.tsx`
**Depends on**: T1, T3
**Reuses**: `TtsController`, game-store age/preference selectors and translated objectives
**Requirements**: CNARR-01, CNARR-03, CNARR-04, CNARR-05, CNARR-06
**Tools**: local filesystem/shell; `tlc-spec-driven`
**Tests**: Unit/React hook
**Gate**: Quick

**Done when**:

- [x] Initial narration runs once per moment under React Strict Mode.
- [x] Moment changes sequence outgoing transition before incoming initial narration.
- [x] Support runs once after 12-second inactivity and resets after activity.
- [x] Blocking, language and moment changes cancel stale work immediately.
- [x] Disabled narration keeps deterministic visible text without a neural request.

**Commit**: `feat(creation): orchestrate Voice Guide narration`

### T9: Render resolved narrative lines in CreationGuide

**Status**: Complete

**What**: Make the passive guide render the hook-resolved line while preserving
the localized objective fallback and non-interactive accessibility contract.
**Where**: `src/components/game/CreationGuide.tsx`,
`src/components/game/CreationGuide.test.tsx`
**Depends on**: T1
**Reuses**: Existing guide styles, live region and journey translations
**Requirements**: CNARR-01, CNARR-05
**Tools**: local filesystem/shell; `tlc-spec-driven`
**Tests**: Component (RTL)
**Gate**: Quick

**Done when**:

- [x] Initial, support and transition lines render without interactive controls.
- [x] The steady objective remains the fallback between narrated lines.
- [x] The guide stays hidden while exploration is inactive.
- [x] Component tests pass in pt-BR and en-US.

**Commit**: `feat(ui): show Creation guide narrative lines`

### T10: Compose narration with overlay priority

**Status**: Complete

**What**: Own the narration hook in `GameOverlay`, pass its line to the guide
and cancel playback behind every existing blocking overlay.
**Where**: `src/components/game/GameOverlay.tsx`,
`src/components/game/GameOverlay.test.tsx`
**Depends on**: T6, T8, T9
**Reuses**: Existing Selah, pause, dialogue and panel priority branches
**Requirements**: CNARR-01, CNARR-04, CNARR-05
**Tools**: local filesystem/shell; `tlc-spec-driven`
**Tests**: Integration (RTL)
**Gate**: Full

**Done when**:

- [x] Voice Guide narration starts only during active Creation exploration.
- [x] Selah, parental pause, dialogue and all local panels cancel it immediately.
- [x] Guide and scripture speech cannot overlap through the shared controller.
- [x] Pointer-lock and existing overlay rendering behavior remain unchanged.

**Commit**: `feat(ui): compose Creation Voice Guide playback`

### T11: Simulate narration and inactivity in the UI lab

**Status**: Complete

**What**: Add deterministic moment/activity controls to `/lab` using the same
production overlay and injectable TTS controller.
**Where**: `src/lab/LabPage.tsx`, `src/lab/LabPage.test.tsx`,
`src/i18n/messages/pt-BR.ts`, `src/i18n/messages/en-US.ts`,
`src/i18n/messages/es-ES.ts`
**Depends on**: T10
**Reuses**: Existing Creation moment selector and lab TTS instance
**Requirements**: CNARR-08
**Tools**: local filesystem/shell; `tlc-spec-driven`
**Tests**: Integration (RTL)
**Gate**: Full

**Done when**:

- [x] Lab can toggle active/inactive exploration without Canvas.
- [x] Moments 1 and 2 exercise initial, support and transition lines.
- [x] Changing interface language replaces visible narration.
- [x] Full integration tests pass in all three locales.

**Commit**: `feat(lab): simulate Creation Voice Guide narration`

### T12: Validate and document the complete feature

**Status**: Complete

**What**: Run the build gate, desktop/mobile browser UAT, verify traceability
and record the final implementation result.
**Where**: `.specs/features/dev3-creation-openrouter-narration/spec.md`,
`.specs/features/dev3-creation-openrouter-narration/tasks.md`
**Depends on**: T2, T3, T4, T7, T8, T9, T10, T11
**Reuses**: `/lab`, production route and feature acceptance criteria
**Requirements**: CNARR-01 through CNARR-08
**Tools**: local filesystem/shell; `tlc-spec-driven`;
`browser:control-in-app-browser`
**Tests**: Full suite + browser UAT
**Gate**: Build

**Done when**:

- [x] Lint, all tests and production build pass with no skipped/deleted tests.
- [x] Desktop and mobile UAT verify visible and audible initial/support/transition flow.
- [x] Neural failure demonstrates local fallback without blocking exploration.
- [x] Every requirement is marked Verified or has an explicit deviation/blocker.

**Commit**: `docs(spec): verify Creation Voice Guide narration`

## Parallel Execution Map

```text
Foundation:
  T1 [P]  catalogue
  T4 [P]  inactivity detector

Speech chain:
  T1 -> T2 -> T3 -> T8

Activity chain:
  T4 -> T5 -> T6

UI chain:
  T1 -> T9
  T6 + T8 + T9 -> T10
  T6 + T10 -> T7
  T10 -> T11

Validation:
  T2..T11 -> T12
```

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1 | One shared catalogue/resolver | Pass |
| T2 | One HTTP endpoint | Pass |
| T3 | One TTS controller capability | Pass |
| T4 | One pure detector | Pass |
| T5 | One runtime bridge | Pass |
| T6 | One Canvas callback contract | Pass |
| T7 | One App transient-state bridge | Pass |
| T8 | One narration flow hook | Pass |
| T9 | One leaf component contract | Pass |
| T10 | One overlay integration | Pass |
| T11 | One lab simulation surface | Pass |
| T12 | One validation/documentation gate | Pass |

## Diagram-Definition Cross-Check

| Task | Depends on | Diagram shows | Status |
| --- | --- | --- | --- |
| T1 | None | Start | Match |
| T2 | T1 | T1 -> T2 | Match |
| T3 | T1, T2 | T1/T2 -> T3 | Match |
| T4 | None | Start | Match |
| T5 | T4 | T4 -> T5 | Match |
| T6 | T5 | T5 -> T6 | Match |
| T7 | T6, T10 | T6/T10 -> T7 | Match |
| T8 | T1, T3 | T1/T3 -> T8 | Match |
| T9 | T1 | T1 -> T9 | Match |
| T10 | T6, T8, T9 | T6/T8/T9 -> T10 | Match |
| T11 | T10 | T10 -> T11 | Match |
| T12 | T2, T3, T4, T7, T8, T9, T10, T11 | All chains -> T12 | Match |

## Test Co-location Validation

| Task | Layer | Required by TESTING.md/design | Declared | Status |
| --- | --- | --- | --- | --- |
| T1 | Shared catalogue/resolver | Unit by design validation | Unit | Match |
| T2 | HTTP endpoint | Integration | Integration | Match |
| T3 | Client service | Unit | Unit | Match |
| T4 | Pure helper | Unit | Unit | Match |
| T5 | R3F runtime bridge | Build | Build | Match |
| T6 | Canvas callback contract | Build | Build | Match |
| T7 | App integration | Integration RTL | Integration RTL | Match |
| T8 | Flow hook | Unit | Unit | Match |
| T9 | React leaf component | Component RTL | Component RTL | Match |
| T10 | GameOverlay | Integration RTL | Integration RTL | Match |
| T11 | LabPage | Integration RTL | Integration RTL | Match |
| T12 | Final UI validation | Build + browser UAT | Build + browser UAT | Match |

## Execution Result

- **Complete**: T1-T12, including the protected guide endpoint, shared TTS
  controller, activity detector, narration flow, production overlay and `/lab`.
- **Automated gate**: lint, 308 tests across 61 files and production build pass;
  no failures or skipped tests. Vite reports only the pre-existing large-chunk warning.
- **Neural smoke test**: the local proxy returned HTTP 200, `audio/mpeg`,
  `Cache-Control: no-store` and a valid 149,376-byte MP3 for an approved ID.
- **Browser UAT**: initial, support, transition and locale replacement passed;
  1440x900 and 390x844 had no horizontal overflow or clipped guide; console clean.
- **Fallback**: controller tests verify exact localized device speech after neural
  failure, without sending fallback text to the proxy.
- **Compatibility fixes**: shared type-only imports use explicit `.ts` extensions
  so the browser catalogue remains consumable by the NodeNext server build.
