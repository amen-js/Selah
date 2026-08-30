# Dev 3 Frontend Hardening

**Status:** Verified

## Goal

Keep the development laboratory out of production artifacts and verify that the DOM overlay safely controls the merged 3D experience without depending on Dev 2 services.

## Requirements

- **HARD-01:** `/lab` loads only in development and its component, fixtures, and mock gateway are absent from production JavaScript.
- **HARD-02:** Production paths continue to render the game when `/lab` is requested outside development.
- **HARD-03:** `App` mounts the game Canvas and DOM overlay together.
- **HARD-04:** Opening any blocking overlay disables exploration and exits pointer lock.
- **HARD-05:** The `P` shortcut exits pointer lock while exploration is active.
- **HARD-06:** Desktop and mobile UAT confirm usable layering, pointer events, focus, and safe-area behavior.

## Verification

- Route and App integration tests pass.
- Production build contains none of the lab-only fixture markers.
- `npm run lint`, `npm run test:run`, and `npm run build` pass.
- Browser UAT passes at 1440×900 and 390×844.

## Verification Result

- Production JavaScript contains none of the lab markers `Laboratório da UI`, `lab-quiz-ia`, `Conteúdo simulado exclusivamente`, or `Nenhum Canvas 3D`.
- Development `/lab` still loads its lazy module and mock scenarios.
- App integration tests cover Canvas/overlay composition, store-driven exploration blocking, pointer-lock release, and the `P` shortcut.
- Desktop and mobile UAT passed; modal panels fit the viewport, scroll internally, and move initial focus to their close action.
- Automated gates passed with 16 test files and 53 tests.
- Pre-existing Three/Rapier deprecation warnings and Chromium-internal pointer/WebGL messages remain outside this UI hardening scope.
