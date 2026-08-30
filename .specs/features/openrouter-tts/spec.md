# OpenRouter TTS Specification

**Date:** 2026-08-30
**Status:** Verified

## Problem

The current verse narration delegates entirely to the browser Web Speech API,
whose available voice and quality vary by device. Selah needs a consistent,
human-sounding voice while retaining an accessible local fallback.

## P1: Neural verse narration

**User story:** As a player, I want the selected-language verse read by a
natural voice so that I can listen to the reflection without changing its
biblical wording.

### Acceptance criteria

1. **TTS-01:** WHEN narration starts THEN the server SHALL synthesize only the
   allowlisted verse text with `x-ai/grok-voice-tts-1.0` and voice `eve`.
2. **TTS-02:** WHEN the selected language is `pt-BR`, `en-US`, or `es-ES` THEN
   the server SHALL retrieve that language's approved YouVersion text and the
   client SHALL play the matching audio.
3. **TTS-03:** WHEN neural synthesis fails or is unavailable THEN the client
   SHALL read the same text with the best compatible local system voice.
4. **TTS-04:** WHEN playback is paused and resumed THEN it SHALL continue from
   its current position rather than restart.
5. **TTS-05:** WHEN the verse, language, phase, or overlay changes THEN stale
   requests and playback SHALL be cancelled and temporary audio released.
6. **TTS-06:** WHEN narration is active THEN ambient Selah audio SHALL be
   reduced and restored after pause, completion, error, or cancellation.
7. **TTS-07:** WHEN the TTS endpoint is abused or unavailable THEN it SHALL
   return bounded `429` or `503` responses without affecting quiz generation.

## Out of scope

- Narrating quiz questions, answers, feedback, or arbitrary user-provided text.
- Translating or rewriting scripture during speech generation.
- Persisting or caching synthesized audio.
- Changing the OpenRouter quiz models or their ZDR policy.

## Verification

- Unit tests for the OpenRouter speech adapter and browser controller.
- Route tests for input validation, allowlist, language, rate limit, timeout,
  response headers, and upstream failure.
- RTL tests for playback state, automatic narration, pause/resume, and language
  replacement.
- Hook tests for ambient audio ducking.
- Final `npm run lint && npm run test:run && npm run build` gate.

## Traceability

| Requirement | Task | Status |
| --- | --- | --- |
| TTS-01, TTS-07 | T1, T2 | Verified |
| TTS-02, TTS-03, TTS-04, TTS-05 | T3, T4 | Verified |
| TTS-06 | T4 | Verified |

## Validation result

- The proxy synthesizes only allowlisted, localized scripture and returns a
  non-cacheable MP3 with timeout and rate limiting.
- Neural playback, local voice fallback, pause/resume, stale language
  cancellation, disclosure, and ambient ducking are covered by automated tests.
- Final gate after rebasing onto `origin/main`: 41 test files and 190 tests
  passed; lint and production build
  passed; no tests were removed or skipped.
