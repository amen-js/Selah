# Creation Guide UI Tasks

**Design**: `.specs/features/dev3-creation-guide-ui/design.md`
**Status**: Done
**Baseline**: 237 tests across 52 files; 0 failures and 0 skipped.

## Execution Plan

```text
T1 -> T2 -> T3 -> T4 -> T5 -> T6 -> T7 -> T8
```

Tasks are sequential because the UI tasks share translation catalogues and CSS,
and the final browser gate is not parallel-safe.

## Task Breakdown

### T1: Expose the transient Creation snapshot

**Status**: Complete
**What**: Add the snapshot type and emit it from `GameCanvas`, clearing it
outside Creation.
**Where**: `src/components/game/creation/progression/types.ts`,
`src/components/game/GameCanvas.tsx`
**Depends on**: None
**Reuses**: `ProgressaoCriacaoRuntime.onMomentoChange`
**Requirements**: CGUI-01, CGUI-04, CGUI-06
**Tools**: local filesystem and `tlc-spec-driven`
**Tests**: Build/static contract
**Gate**: Build

**Done when**:

- [x] Snapshot contains the canonical moment and state.
- [x] Creation emits snapshots and other regions emit `null`.
- [x] No Zustand or storage contract changes.
- [x] `npm run lint && npm run test:run && npm run build` passes with at least 237 tests.

**Commit**: `feat(creation): expose narrative progress snapshot`

### T2: Create the localized Creation UI catalogue

**Status**: Implemented
**What**: Map all nine moment IDs to translated title and concise objective
keys, with a pure coverage test.
**Where**: `src/components/game/creationJourneyUi.ts`,
`src/components/game/creationJourneyUi.test.ts`, `src/i18n/messages/*.ts`
**Depends on**: T1
**Reuses**: `MomentoCriacaoId` and typed translation keys
**Requirements**: CGUI-02, CGUI-03, CGUI-08
**Tools**: local filesystem and `tlc-spec-driven`
**Tests**: Unit
**Gate**: Quick

**Done when**:

- [x] All nine moment IDs resolve to a title and objective in three languages.
- [x] Objectives match implemented movement/proximity behavior.
- [x] `npm run test:run -- src/components/game/creationJourneyUi.test.ts` passes 2 tests.

**Commit**: `feat(ui): define Creation journey copy`

### T3: Create the non-blocking Voice Guide

**Status**: Implemented
**What**: Create `CreationGuide` with translated labels, current objective,
responsive styling and component tests.
**Where**: `src/components/game/CreationGuide.tsx`,
`src/components/game/CreationGuide.test.tsx`, `src/index.css`
**Depends on**: T2
**Reuses**: existing overlay tokens and `SnapshotProgressaoCriacao`
**Requirements**: CGUI-03, CGUI-08
**Tools**: local filesystem and `tlc-spec-driven`
**Tests**: Component RTL
**Gate**: Quick

**Done when**:

- [x] Guide is a polite live region with no focusable or interactive control.
- [x] It displays the localized moment title and concise objective.
- [x] It renders nothing when exploration is inactive.
- [x] `npm run test:run -- src/components/game/CreationGuide.test.tsx` passes 3 tests.

**Commit**: `feat(ui): add Creation Voice Guide`

### T4: Add Creation moment progress to the HUD

**Status**: Implemented
**What**: Extend `Hud` to render moment order, total and title when a snapshot
is present.
**Where**: `src/components/game/Hud.tsx`, `src/components/game/Hud.test.tsx`,
`src/i18n/messages/*.ts`, `src/index.css`
**Depends on**: T3
**Reuses**: existing HUD pills and Creation catalogue length
**Requirements**: CGUI-02, CGUI-08
**Tools**: local filesystem and `tlc-spec-driven`
**Tests**: Component RTL
**Gate**: Quick

**Done when**:

- [x] HUD shows `Momento 1 de 9` independently of passage count.
- [x] HUD updates to moment 2 when the snapshot changes.
- [x] HUD exposes completed progress with a native progress element.
- [x] HUD remains unchanged without a snapshot.
- [x] `npm run test:run -- src/components/game/Hud.test.tsx` passes at least 8 tests.

**Commit**: `feat(ui): show Creation journey progress`

### T5: Compose Creation guidance in GameOverlay

**Status**: Implemented
**What**: Pass the snapshot to `Hud` and render `CreationGuide` only during
normal exploration.
**Where**: `src/components/game/GameOverlay.tsx`,
`src/components/game/GameOverlay.test.tsx`
**Depends on**: T4
**Reuses**: existing overlay priority branches
**Requirements**: CGUI-03, CGUI-05
**Tools**: local filesystem and `tlc-spec-driven`
**Tests**: Integration RTL
**Gate**: Full

**Done when**:

- [x] HUD and Guide render together in normal Creation exploration.
- [x] Guide hides for dialog and local panels.
- [x] Guide hides while exploration is inactive behind the start screen.
- [x] Selah and parental pause remain exclusive blocking overlays.
- [x] `npm run test:run` passes at least 247 tests.

**Commit**: `feat(ui): compose Creation guidance overlay`

### T6: Connect GameCanvas progress to App

**Status**: Complete
**What**: Store the snapshot transiently in `App` and feed `GameOverlay`.
**Where**: `src/App.tsx`, `src/App.test.tsx`
**Depends on**: T5
**Reuses**: existing Canvas and overlay composition
**Requirements**: CGUI-01, CGUI-04, CGUI-06
**Tools**: local filesystem and `tlc-spec-driven`
**Tests**: Integration RTL
**Gate**: Full

**Done when**:

- [x] App forwards Canvas snapshots to the production overlay.
- [x] App clears guidance after a `null` snapshot.
- [x] No snapshot is added to local storage.
- [x] `npm run test:run` passes at least 249 tests.

**Commit**: `feat(app): connect Creation progress to DOM`

### T7: Simulate Creation moments in the UI lab

**Status**: Implemented
**What**: Add a moment selector that feeds the same production overlay without
mounting Canvas.
**Where**: `src/lab/LabPage.tsx`, `src/lab/LabPage.test.tsx`,
`src/i18n/messages/*.ts`
**Depends on**: T6
**Reuses**: `momentosCriacao` and existing lab controls
**Requirements**: CGUI-07, CGUI-08
**Tools**: local filesystem and `tlc-spec-driven`
**Tests**: Integration RTL
**Gate**: Full

**Done when**:

- [x] Lab switches between moments 1 and 2 without Canvas.
- [x] Changing UI language updates moment title and objective.
- [x] `npm run test:run` passes at least 250 tests.

**Commit**: `feat(lab): simulate Creation journey moments`

### T8: Validate the complete vertical slice

**Status**: Complete
**What**: Run the build gate, desktop/mobile UAT and update traceability.
**Where**: `.specs/features/dev3-creation-guide-ui/spec.md`,
`.specs/features/dev3-creation-guide-ui/tasks.md`
**Depends on**: T7
**Reuses**: `/lab` and production route
**Requirements**: CGUI-01 through CGUI-08
**Tools**: local filesystem, in-app browser and `tlc-spec-driven`
**Tests**: Full suite + browser UAT
**Gate**: Build

**Done when**:

- [x] `npm run lint && npm run test:run && npm run build` passes with 274 tests
      after integrating `origin/main`.
- [x] Desktop 1440x900 and mobile 390x844 show no overlap or clipped controls.
- [x] Pointer lock and overlay priority remain correct.
- [x] All eight requirements are marked Verified.

**UAT evidence**:

- Production `GameOverlay` simulated in `/lab` at moments 1, 2 and 9.
- pt-BR, en-US and es-ES copy updated immediately with the interface language.
- Voice Guide disappeared behind dialogue and Selah, then returned to exploration.
- Browser console reported no errors or warnings.

**Commit**: `docs(spec): verify Creation Guide UI`

## Diagram-Definition Cross-Check

| Task | Depends on | Diagram shows | Status |
| --- | --- | --- | --- |
| T1 | None | Start | ✅ Match |
| T2 | T1 | T1 -> T2 | ✅ Match |
| T3 | T2 | T2 -> T3 | ✅ Match |
| T4 | T3 | T3 -> T4 | ✅ Match |
| T5 | T4 | T4 -> T5 | ✅ Match |
| T6 | T5 | T5 -> T6 | ✅ Match |
| T7 | T6 | T6 -> T7 | ✅ Match |
| T8 | T7 | T7 -> T8 | ✅ Match |

## Test Co-location Validation

| Task | Layer | Matrix requires | Task says | Status |
| --- | --- | --- | --- | --- |
| T1 | Shared types / Canvas contract | Build | Build | ✅ OK |
| T2 | Pure UI catalogue | Unit | Unit | ✅ OK |
| T3 | React leaf + CSS | RTL + browser UAT | RTL; UAT in T8 | ✅ OK |
| T4 | React leaf + CSS | RTL + browser UAT | RTL; UAT in T8 | ✅ OK |
| T5 | GameOverlay | Integration RTL | Integration RTL | ✅ OK |
| T6 | App composition | Integration RTL | Integration RTL | ✅ OK |
| T7 | LabPage | Integration RTL | Integration RTL | ✅ OK |
| T8 | CSS/feature validation | Build + browser UAT | Build + browser UAT | ✅ OK |

## Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1 | One Canvas-to-DOM contract | ✅ Cohesive |
| T2 | One pure UI catalogue | ✅ Granular |
| T3 | One leaf component | ✅ Granular |
| T4 | One existing component extension | ✅ Granular |
| T5 | One integration component | ✅ Granular |
| T6 | One application composition | ✅ Granular |
| T7 | One lab integration | ✅ Granular |
| T8 | One validation/reporting pass | ✅ Granular |
