# Quick Task 001: Remove verse focus outline

**Date:** 2026-08-30
**Status:** Done

## Description

Keep programmatic focus on the Bible verse heading for assistive technology,
but do not draw the global keyboard-focus outline around the non-interactive
text.

## Files Changed

- `src/index.css` — suppress the visible outline only for the focused verse
  heading.

## Verification

- [x] The verse heading still receives focus when the verse phase opens.
- [x] The yellow focus rectangle is not visible around the Bible text.
- [x] Interactive controls keep their normal focus indication.
- [x] Lint, tests, and production build pass.

## Commit

`599096f` — `fix(ui): hide verse focus outline`
