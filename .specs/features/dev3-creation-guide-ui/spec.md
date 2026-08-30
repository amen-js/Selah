# Creation Guide UI Specification

## Problem Statement

The Creation runtime already knows the active one of nine narrative moments, but
that state is trapped inside the R3F tree. Children can see the environment
change without a DOM explanation of what they are discovering or what to do
next.

## Goals

- [ ] Expose the transient Creation progression to the DOM without duplicating
      persistence or progression rules.
- [ ] Show the active moment, journey progress and a short localized Voice Guide objective while
      exploration remains interactive.
- [ ] Make the first two moments testable without a Canvas in `/lab`.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Recorded Voice Guide audio | The GDD still leaves full narration scope open. |
| Full initial/support/conclusion narrative sequence | It needs editorial pagination, approved translations and an inactivity signal. |
| Biome discovery state | The merged runtime models moments, not the four biome milestones. |
| Final World 1 completion screen | This slice validates the beginning of the journey first. |
| New Zustand persistence | Completed Selah history remains the canonical safe checkpoint. |

## User Stories

### P1: Understand the current Creation moment ⭐ MVP

**User Story**: As a child exploring Creation, I want to see where I am in the
nine-moment journey and receive a calm hint so that environmental changes make
sense.

**Acceptance Criteria**:

1. WHEN the Creation runtime emits a moment THEN the DOM SHALL show its order,
   localized title and short localized objective.
2. WHEN the runtime advances from `vazio` to `luz` THEN the DOM SHALL update from
   moment 1 of 9 to moment 2 of 9.
3. WHEN the active region is not Creation THEN the DOM SHALL show no Creation
   journey status.
4. WHEN the Voice Guide is visible THEN it SHALL remain non-interactive and
   SHALL NOT block movement or pointer lock.
5. WHEN the start or pause screen is in front of the game THEN the Voice Guide
   SHALL NOT render or announce content.

**Independent Test**: Feed snapshots for `vazio` and `luz` to the overlay and
observe the status and Voice Guide copy update without changing the store.

### P1: Preserve overlay priority ⭐ MVP

**User Story**: As a child or responsible adult, I want Selah, parental pause
and settings to remain unambiguous so that guidance never competes with a
blocking flow.

**Acceptance Criteria**:

1. WHEN a Selah or parental pause is active THEN the existing blocking overlay
   SHALL take precedence over Creation guidance.
2. WHEN a dialog or local panel is open THEN the Voice Guide SHALL be hidden.
3. WHEN only normal exploration is active THEN the HUD and Voice Guide SHALL be
   visible together.

**Independent Test**: Render `GameOverlay` with a Creation snapshot and toggle
each existing overlay state.

### P2: Simulate the journey without WebGL

**User Story**: As a developer or reviewer, I want to select a Creation moment
in `/lab` so that the interface can be reviewed without loading the 3D scene.

**Acceptance Criteria**:

1. WHEN a moment is selected in `/lab` THEN the same production overlay SHALL
   render that snapshot.
2. WHEN the interface language changes THEN moment titles, objectives and UI
   labels SHALL translate immediately.

**Independent Test**: Open `/lab`, switch from moment 1 to 2 and change the UI
language.

## Edge Cases

- WHEN no snapshot has been emitted THEN the existing HUD SHALL render without
  Creation status.
- WHEN React Strict Mode repeats effects THEN no persistent or duplicate dialog
  state SHALL be created.
- WHEN the final moment is complete THEN the DOM SHALL accept and display the
  9-of-9 snapshot without inventing a tenth moment.
- WHEN progress is emitted THEN no new progress fields SHALL be written to
  `localStorage`.

## Requirement Traceability

| Requirement ID | Story | Status |
| --- | --- | --- |
| CGUI-01 | P1: transient Canvas-to-DOM snapshot | Implemented |
| CGUI-02 | P1: moment order and title in HUD | Implemented |
| CGUI-03 | P1: non-blocking localized Voice Guide objective | Implemented |
| CGUI-04 | P1: clear snapshot outside Creation | Implemented |
| CGUI-05 | P1: preserve overlay priority | Pending |
| CGUI-06 | P1: no new persisted progress | Implemented |
| CGUI-07 | P2: `/lab` moment simulation | Pending |
| CGUI-08 | P2: translated moment titles, objectives and UI labels | Implemented |

**Coverage**: 8 total, 8 mapped to tasks, 0 unmapped.

## Success Criteria

- [ ] Moments 1 and 2 can be demonstrated end-to-end with the production
      overlay.
- [ ] Existing progression, store, Selah and pointer-lock behavior remains green.
- [ ] Lint, all tests, production build and desktop/mobile browser UAT pass.
