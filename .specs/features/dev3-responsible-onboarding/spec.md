# Responsible Onboarding Specification

**Status:** Verified

## Problem Statement

The game currently allows a first-time player to enter the 3D world before a
responsible adult sees the privacy, AI, and parental-pause choices. The safe
defaults already exist in the Zustand store, but they need a clear first-run
interface that makes those choices visible without blocking later access to the
existing parental settings.

## Goals

- Require one explicit responsible-adult confirmation before the first journey.
- Keep saving and aggregate-metrics sharing disabled unless explicitly enabled.
- Reuse the existing language, age-group, AI, and persistence contracts.
- Keep the experience accessible and localized in all three supported locales.

## Out of Scope

- Accounts, remote profiles, age verification, PINs, authentication, or server changes.
- TTS configuration, visual-identity assets, 3D controls, and playable-region changes.
- A multi-step wizard or new routing library.

## P1: Responsible Adult Configures the First Journey

**User story:** As a responsible adult, I want to understand and configure the
first journey so that the child begins with deliberate privacy and AI choices.

### Acceptance Criteria

1. **ONB-01:** WHEN the initial setup has not been completed THEN the game SHALL
   show the responsible onboarding above the world and SHALL NOT request pointer lock.
2. **ONB-02:** WHEN the responsible adult changes the language THEN all onboarding
   copy and accessible labels SHALL update immediately.
3. **ONB-03:** WHEN the onboarding opens with a fresh store THEN saving and metrics
   sharing SHALL be disabled, while the current age-group and AI defaults remain visible.
4. **ONB-04:** WHEN the responsible adult changes age group, AI, saving, or metrics
   THEN the shared store SHALL reflect each choice.
5. **ONB-05:** WHEN the responsible adult confirms the setup THEN the completion
   flag SHALL persist locally even when gameplay progress is not saved, and the
   normal game entry screen SHALL become available.
6. **ONB-06:** WHEN all local progress is deleted THEN the completion flag SHALL
   reset and the onboarding SHALL appear again.
7. **ONB-07:** WHEN the onboarding is used by keyboard or on a mobile viewport THEN
   it SHALL expose a labelled dialog, visible focus, scrollable content, and a
   single clear confirmation action.

**Independent test:** Start with empty local storage, configure the choices,
confirm, enter the world, then delete progress and verify that setup is required again.

## Success Criteria

- All seven requirements are covered by store, component, or integration tests.
- Portuguese, English, and Spanish catalogs remain complete and aligned.
- `npm run lint`, `npm run test:run`, and `npm run build` pass without deleting or skipping tests.
- Desktop and mobile browser UAT confirm usable layout, focus, and immediate translation.

## Requirement Traceability

| Requirement | Verification | Status |
| --- | --- | --- |
| ONB-01 | App integration test | Verified |
| ONB-02 | Component test + browser UAT | Verified |
| ONB-03 | Store + component tests | Verified |
| ONB-04 | Component test | Verified |
| ONB-05 | Store + App integration tests | Verified |
| ONB-06 | Store + App integration tests | Verified |
| ONB-07 | Component test + desktop/mobile UAT | Verified |

## Validation Result

- Fresh storage showed only the labelled responsible-adult dialog, with focus on
  its heading and no background HUD controls exposed to keyboard or assistive technology.
- Saving and metrics started disabled; AI started enabled; changing age group,
  AI, saving, and metrics updated the shared store.
- Portuguese changed immediately to English while the dialog was open, including
  labels, explanations, and the confirmation action.
- Confirming setup persisted the completion preference and revealed the normal
  game-entry screen; deleting local progress reset setup without changing the
  current in-memory interface language mid-action.
- Browser UAT passed at 1440×900 and 390×844. The panel scrolled internally,
  the confirmation action remained reachable, and there was no horizontal overflow.
- Automated gate passed with 29 test files and 120 tests, up from 115 before the
  feature; lint and production build passed with no skipped or deleted tests.
- The pre-existing Three/Rapier deprecation messages and the existing large-bundle
  build warning remain outside this feature scope.
