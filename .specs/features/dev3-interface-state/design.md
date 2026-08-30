# Dev 3 Interface and State Design

**Spec:** `.specs/features/dev3-interface-state/spec.md`
**Status:** Approved

## Architecture

```text
Dev 1 collectible -> gameStore.abrirSelah -> GameOverlay -> useSelahFlow
                                                    |-> typed HTTP gateway -> Dev 2 API
                                                    |-> public verse/quiz UI
answer -> evaluation -> local minimal history -> parental pause -> Dev 1 resumes
```

- Shared wire and state types live in `src/types/selah.ts`.
- `src/stores/gameStore.ts` owns local state, selectors, safe persistence, and flow transitions.
- `src/services/selahGateway.ts` isolates the HTTP contract and accepts an injectable base URL/fetch implementation.
- Leaf UI components live under `src/components/game/`; `GameOverlay` composes them without importing 3D code.
- `src/lab/` provides deterministic fixtures and a gateway fake used only by the development route.
- Global design tokens remain in `src/index.css` so Figma styling can be applied without restructuring components.

## Privacy Decisions

- The public quiz never contains the answer key or pre-answer explanation.
- Full verse and generated quiz content remain in memory only.
- Metrics are sent only after local consent and contain no persistent identifier or timestamp.
- Network failures do not persist or retry metric events.

## Accessibility Decisions

- Full-screen surfaces use dialog semantics and deliberate focus placement.
- Interactive targets are at least 44px; status changes use live regions.
- The three-second parental hold has visual progress but no numerical countdown.
