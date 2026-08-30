# Creation OpenRouter Narration Context

**Gathered**: 2026-08-30
**Spec**: `.specs/features/dev3-creation-openrouter-narration/spec.md`
**Status**: Design drafted

## Feature Boundary

Deliver the approved initial, support and transition Voice Guide lines across
the nine Creation moments, using protected OpenRouter neural TTS with local
fallback and without changing biome discovery or World 1 completion behavior.

## Implementation Decisions

### Neural narration

- The Voice Guide uses the project's existing OpenRouter TTS model and voice.
- Coverage is integral across the Creation journey, not limited to Selah.
- The scripture `/api/tts` contract remains unchanged.
- The browser never supplies arbitrary synthesis text; it requests an approved
  narration ID and language.

### Automatic playback

- The existing age/preference rules remain authoritative: child profiles or an
  enabled read-aloud preference receive automatic narration.
- Text remains available when narration is disabled or browser autoplay blocks
  audio.
- Local compatible speech is the fallback for neural failure or unavailability.

### Calm inactivity support

- A support line becomes eligible after 12 seconds without meaningful movement
  or interaction during active exploration.
- It plays once per inactivity episode, resets after activity resumes and never
  invents replacement copy.

### Overlay priority

- Selah, dialogue, local panels, onboarding, start/pause state and parental
  pause cancel guide narration immediately.
- Moment, region and interface-language changes invalidate stale requests and
  playback.

### Agent's Discretion

- Exact internal state-machine structure and component boundaries.
- The minimal visual timing used to hand off from a transition line to the next
  initial line when automatic narration is disabled.
- Test fixture structure, provided all approved behavior remains deterministic.

## Specific References

- GDD Voice Guide direction and scripts in `docs/GDD.md`.
- Existing protected scripture narration in `.specs/features/openrouter-tts/`.
- Existing non-blocking Creation guide in
  `.specs/features/dev3-creation-guide-ui/`.

## Deferred Ideas

- Recorded human voice packs.
- Biome discovery narration.
- World 1 completion presentation.
