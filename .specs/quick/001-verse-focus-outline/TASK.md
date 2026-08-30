# Quick Task 001: Remove verse focus outline

**Date:** 2026-08-30
**Status:** In Progress

## Description

Keep programmatic focus on the Bible verse heading for assistive technology,
but do not draw the global keyboard-focus outline around the non-interactive
text.

## Files Changed

- `src/index.css` — suppress the visible outline only for the focused verse
  heading.

## Verification

- [ ] The verse heading still receives focus when the verse phase opens.
- [ ] The yellow focus rectangle is not visible around the Bible text.
- [ ] Interactive controls keep their normal focus indication.
- [ ] Lint, tests, and production build pass.

## Commit

Pending.
