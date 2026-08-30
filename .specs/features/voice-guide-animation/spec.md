# Voice Guide text animation

**Date:** 2026-08-30
**Status:** Done

## Goal

Give the Voice Guide the same calm visual rhythm as the Selah passage and quiz
without duplicating the existing typewriter implementation.

## Requirements

- The Voice Guide card enters with a subtle fade, lift and scale.
- Each new narrated line reveals progressively while reserving its final space.
- The complete line remains available to assistive technology immediately.
- Reduced-motion preferences show the complete line without visual typing.
- The Selah passage and quiz retain their existing animation behavior after the
  typewriter component is extracted for reuse.

## Verification

- Component tests cover progressive reveal and accessible full text.
- Existing Selah animation tests remain green.
- Full gate: lint, 82 test files and 456 tests passed; production build passed.
- Browser UAT: entry animation, partial text, cursor and final layout verified in
  the local Lab with no console errors.

## Commit

`32a1c74` — `feat(ui): animate Voice Guide narration`
