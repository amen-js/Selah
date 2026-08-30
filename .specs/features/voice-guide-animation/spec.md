# Voice Guide text animation

**Date:** 2026-08-30
**Status:** In Progress

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
- Lint, all tests, production build and browser UAT pass.
