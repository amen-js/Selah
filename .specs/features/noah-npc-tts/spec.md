# Noah NPC Mission TTS

**Status:** In progress
**Scope:** Medium
**Date:** 2026-08-30

## Goal

Narrate each localized line of Noah's opening mission dialog with the existing
neural TTS controller and local browser fallback, without changing the dialog's
visual flow or checkpoint semantics.

## Requirements

- The three mission lines are approved narration IDs shared by client and
  server for `pt-BR`, `en-US`, and `es-ES`.
- `/api/tts/narracao` accepts only an approved ID and supported language; the
  server resolves the exact text and never accepts arbitrary client text.
- A child profile, or a general profile with TTS enabled, automatically narrates
  the currently visible line.
- Continuing cancels stale playback before narrating the next line. Closing,
  unmounting, disabling TTS, or changing language also cancels stale playback.
- Neural playback keeps the existing browser speech fallback and operation
  invalidation behavior from `TtsController`.
- Audio completion does not advance the dialog. The existing buttons remain the
  only way to continue, begin the mission, or listen later.

## Verification

- Catalog tests cover every mission ID and supported language.
- API and TTS controller tests cover the approved Noah narration contract.
- Component tests cover automatic narration, silent preference, line changes,
  language changes, cancellation, and React Strict Mode.
- `npm run lint && npm run test:run && npm run build` passes.
