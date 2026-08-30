# Quick Task 002: Animate Selah text and modal entrance

**Date:** 2026-08-30
**Status:** In Progress

## Description

Reveal Bible passages and quiz copy with a typewriter cadence, coordinate the
passage effect with narration state, and soften the Selah modal entrance.

## Files Changed

- `src/components/game/SelahOverlay.tsx` — stage passage, quiz, answer and
  feedback text while preserving their complete accessible names.
- `src/components/game/SelahOverlay.test.tsx` — verify progressive text,
  narration pause/resume and staged quiz content.
- `src/index.css` — animate the backdrop, card and cursor, including the
  reduced-motion fallback.

## Verification

- [ ] The Selah card fades and scales into view without appearing abruptly.
- [ ] Passage text reveals progressively and pauses with paused narration.
- [ ] Quiz question and alternatives reveal in a readable sequence.
- [ ] Full text remains immediately available to assistive technology.
- [ ] Reduced-motion users see the complete copy without the typing effect.
- [ ] Lint, tests, production build and browser UAT pass.

## Commit

Pending.
