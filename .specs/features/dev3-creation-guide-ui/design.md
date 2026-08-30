# Creation Guide UI Design

**Spec**: `.specs/features/dev3-creation-guide-ui/spec.md`
**Status**: Approved

## Architecture Overview

The merged Creation state machine remains the only source of truth. The feature
adds a read-only projection from the R3F runtime to the DOM:

```text
ProgressaoCriacaoRuntime
  -> World onMomentoChange
  -> GameCanvas onProgressaoCriacaoChange
  -> App transient state
  -> GameOverlay
       -> Hud
       -> CreationGuide
```

Leaving Creation emits `null`. Nothing from this projection is added to Zustand
or local storage.

## Code Reuse Analysis

| Existing code | How it is reused |
| --- | --- |
| `ProgressaoCriacaoRuntime` | Continues to emit canonical moment and state changes. |
| `MomentoCriacao` and `EstadoProgressaoCriacao` | Form the read-only snapshot contract. |
| `GameOverlay` priority branches | Keep Selah and parental pause ahead of normal exploration UI. |
| `Hud` | Adds journey status without replacing region or passage information. |
| `/lab` | Exercises the production DOM overlay with mock state and no Canvas. |
| Existing i18n catalogues | Translate UI labels in all three supported languages. |

## Components and Interfaces

### SnapshotProgressaoCriacao

- **Location**: `src/components/game/creation/progression/types.ts`
- **Purpose**: Name the transient pair of canonical moment and canonical state.
- **Persistence**: None.

```ts
interface SnapshotProgressaoCriacao {
  readonly momento: MomentoCriacao
  readonly estado: EstadoProgressaoCriacao
}
```

### GameCanvas bridge

- **Location**: `src/components/game/GameCanvas.tsx`
- **Interface**:
  `onProgressaoCriacaoChange?: (snapshot: SnapshotProgressaoCriacao | null) => void`
- **Behavior**: Emits only from the existing runtime effect and emits `null`
  outside Creation.

### CreationGuide

- **Location**: `src/components/game/CreationGuide.tsx`
- **Purpose**: Show the calm Voice Guide identity and current localized objective as a
  non-interactive live region.
- **Dependencies**: A `SnapshotProgressaoCriacao` prop and translated UI labels.
- **Accessibility**: `aria-live="polite"`; no buttons, pointer events or focus.

### Hud extension

- **Location**: `src/components/game/Hud.tsx`
- **Purpose**: Show `Momento N de 9`, a native progress element and the localized
  current moment title when a snapshot is present.
- **Fallback**: Existing HUD remains unchanged when snapshot is null.

### App and GameOverlay composition

- **Locations**: `src/App.tsx`, `src/components/game/GameOverlay.tsx`
- **Purpose**: Own only the transient snapshot and pass it to the normal
  exploration overlay together with `exploracaoAtiva`.
- **Priority**: Voice Guide is omitted during dialog or local panel display;
  existing early returns preserve Selah and parental pause precedence. It is
  also omitted behind the start/pause screen.

### Creation journey UI catalogue

- **Location**: `src/components/game/creationJourneyUi.ts`
- **Purpose**: Map all nine stable moment IDs to translated title and concise
  objective keys.
- **Constraint**: Objectives describe implemented proximity/movement behavior;
  they do not claim touch interaction or inactivity detection.

### Lab simulation

- **Location**: `src/lab/LabPage.tsx`
- **Purpose**: Build a snapshot from the production catalogue for review without
  mounting WebGL.

## Error Handling Strategy

| Scenario | Handling | User impact |
| --- | --- | --- |
| No snapshot yet | Render existing HUD only | No empty or misleading objective |
| Region changes away from Creation | Emit and store `null` | Creation guidance disappears |
| Repeated identical snapshot | React renders the same projection | No persisted duplicate state |
| Blocking overlay opens | Existing overlay priority hides guidance | One clear task at a time |

## Tech Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| State transport | Callback + transient App state | Avoids duplicating canonical progress in Zustand. |
| Guide content in this slice | Short UI objective by moment ID | Correctly describes implemented interaction and fits a passive hint. |
| Full narrative copy | Defer initial/support/conclusion sequence | It needs pagination, translations and runtime timing signals. |
| Interaction | No dismiss/action button | Guidance must not compete with movement or pointer lock. |
