# Dev 3 Interface and State Specification

**Status:** Verified for the functional UI milestone

## Goal

Deliver the React DOM interface and privacy-safe local state for the Selah demo without depending on the 3D canvas.

## Requirements

- **UI-01:** Dev 1 can open a Selah through one typed Zustand action and read one exploration-blocking selector.
- **UI-02:** The UI supports HUD, language selection, NPC disclosure, journal, parental settings, local dashboard, and a development-only `/lab` route.
- **UI-03:** A Selah shows an approved verse, optional TTS, exactly four public alternatives, server-side evaluation, feedback, and parental pause.
- **UI-04:** Parental pause releases only after a continuous three-second hold and never blocks closing the browser.
- **STATE-01:** Persistence stores only local preferences, passage IDs, aggregate counters, minimal A/B/C/D results, and the parental-pause flag.
- **STATE-02:** Playing without save excludes gameplay progress and history from local persistence; clearing progress removes the whole persisted key.
- **API-01:** The frontend gateway supports verse, quiz generation, quiz response, and consent-gated aggregate metrics without exposing answer keys.
- **A11Y-01:** Critical flows are keyboard accessible, have visible focus, support reduced motion, and remain usable at desktop and mobile viewports.

## Out of Scope

- Three.js, Rapier, Ecctrl, backend endpoint implementation, AI prompts, fallback curation, Figma creation, PWA, Capacitor, and additional playable regions.

## Acceptance

- The `/lab` flow works without a Canvas and exercises success, fallback, failure, and parental-pause states.
- `npm run lint`, `npm run test:run`, and `npm run build` pass.
- Browser UAT confirms the full Selah flow and privacy controls.

## Verification Result

- UI-01 through UI-04, STATE-01, STATE-02, API-01, and A11Y-01 are implemented and verified.
- Automated gate: 15 test files and 50 passing tests, with lint and production build passing.
- Browser UAT: success, fallback, controlled error, settings, visible persistence, parental-pause early release, 1440×900, and 390×844 passed.
- The final Figma token pass remains waiting for designer assets and does not block the functional milestone.
