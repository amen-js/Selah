# Interface Internationalization Specification

**Status:** Verified

## Goal

Use the persisted `idioma` preference as the single source of truth for the Selah interface, accessibility copy, document metadata, and future scripture/quiz requests.

## Requirements

- **I18N-01:** `pt-BR`, `en-US`, and `es-ES` SHALL have complete, non-empty UI catalogs with identical keys and placeholders.
- **I18N-02:** Changing the language SHALL update visible UI and accessibility labels immediately without a reload.
- **I18N-03:** The existing Zustand `idioma` and `setIdioma` contract SHALL remain the only locale state and keep its current persistence behavior.
- **I18N-04:** `<html lang>`, document title, and meta description SHALL follow the selected locale.
- **I18N-05:** App entry, HUD, dialogs, journal, dashboard, settings, Selah flow, parental pause, and `/lab` controls SHALL be localized.
- **I18N-06:** Scripture, references, quizzes, alternatives, explanations, passage IDs, and caller-provided NPC copy SHALL remain upstream data and SHALL NOT be translated by the UI catalog.
- **I18N-07:** User-visible flow errors SHALL use the active locale while internal gateway exceptions remain diagnostic.
- **I18N-08:** English and Spanish copy SHALL remain usable at 1440x900 and 390x844 without clipping, inaccessible focus, or broken modal scrolling.

## Defaults and Boundaries

- Missing/invalid catalog lookup falls back to `pt-BR`.
- Language names remain autonyms: Português, English, Español.
- Brand `Selah`, technical IDs, `WASD`, and `P` remain unchanged.
- `/lab` structure is translated; existing mocked biblical/quiz data is not.
- English and Spanish copy is demo-ready and flagged for later editorial review.

## Acceptance

- Catalog parity, placeholder parity, interpolation, fallback, and plural copy have automated tests.
- Switching locale updates open panels, ARIA labels, document metadata, and subsequent gateway input.
- Existing tests are preserved; test count stays at or above 53 plus new cases.
- `npm run lint`, `npm run test:run`, and `npm run build` pass.
- Browser UAT passes for all three locales on desktop and mobile.

## Validation record

- `npm run lint`, `npm run test:run`, and `npm run build` passed on 2026-08-30.
- Vitest passed 87 tests across 21 files after integrating the latest `main`; no test was skipped or removed.
- Catalog audit found identical, non-empty keys and aligned placeholders in all locales.
- Literal audit left only the `Selah` brand, keycaps, technical IDs, and upstream data outside the catalogs.
- Production output contained one application bundle and no laboratory fixture text or IDs.
- Browser UAT passed in `pt-BR`, `en-US`, and `es-ES` at 1440x900 and 390x844 with synchronized metadata, no horizontal overflow, localized focus targets, scrollable panels, four quiz alternatives, feedback, and parental pause.
- Mobile UAT found and verified a lab-only modal overlap fix; modal content now starts below the laboratory controls and remains internally scrollable.
- English and Spanish copy remains queued for the planned editorial review; this does not block the demo-ready implementation.
