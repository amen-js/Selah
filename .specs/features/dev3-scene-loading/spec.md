# Dev 3 Scene Loading Experience

**Status:** Implementing

## Problem

The production app mounts the entry screen while the Three.js loading manager is
still preparing the world. A player can request pointer lock before the scene is
ready, and asset or render failures have no visible recovery path.

## Goals

- Make world preparation feel intentional and on-brand instead of exposing an
  empty or incomplete canvas.
- Keep entry and exploration unavailable until the current scene is ready.
- Give asset and render failures a clear, safe recovery action.

## Requirements

1. **LOAD-01:** WHEN the current Three.js asset batch has not completed THEN the
   app SHALL hide the entry experience and block exploration.
2. **LOAD-02:** WHILE assets are loading THEN the app SHALL show localized,
   accessible progress without exposing raw asset URLs.
3. **LOAD-03:** WHEN the asset batch completes without errors THEN the loading
   experience SHALL leave and the existing entry experience SHALL become usable.
4. **REC-01:** WHEN the loading manager reports an error or the scene render tree
   throws THEN the app SHALL stop exploration and show a localized recovery state.
5. **REC-02:** WHEN the player activates the recovery action THEN the app SHALL
   request a full page reload so WebGL and asset loaders start from a clean state.
6. **UX-01:** WHEN the experience runs on desktop, mobile, keyboard, screen reader,
   or reduced-motion settings THEN the loading and recovery states SHALL remain
   readable and operable.
7. **INT-01:** WHEN responsible onboarding is incomplete THEN it SHALL remain the
   only interactive foreground experience while scene loading continues behind it.

## Out of Scope

- Changing maps, physics, models, loaders, or scene composition.
- Compressing assets or changing the production deployment.
- Offline caching, service workers, PWA, or resumable downloads.
- Artificial delays added only to keep the loading screen visible.

## Verification

| Requirement | Evidence | Status |
| --- | --- | --- |
| LOAD-01 | App integration test + browser UAT | Implementing |
| LOAD-02 | Component test + i18n parity + browser UAT | Implementing |
| LOAD-03 | App integration test + browser UAT | Implementing |
| REC-01 | App integration test | Implementing |
| REC-02 | Component/App integration test | Implementing |
| UX-01 | Component test + desktop/mobile UAT | Implementing |
| INT-01 | App integration test | Implementing |

