# Creation OpenRouter Narration Specification

**Status**: Approved

## Problem Statement

The Creation Guide currently shows one concise objective for the active moment,
while the GDD defines initial, support and transition narration across all nine
moments. Selah already has protected OpenRouter neural TTS for allowlisted
scripture, but that endpoint intentionally rejects arbitrary narration text.

## Goals

- [ ] Present the approved initial, support and transition script for all nine
      Creation moments in localized, two-line Voice Guide bubbles.
- [ ] Narrate eligible guide lines with the existing OpenRouter TTS model and
      voice, preserving a compatible local device voice as fallback.
- [ ] Keep narration cancellable, non-blocking, privacy-safe and subordinate to
      Selah, dialogue, settings, onboarding and parental pause.

## Out of Scope

| Feature | Reason |
| --- | --- |
| LLM-generated guide copy | Every spoken line must be editorially approved. |
| Client-provided free text synthesis | The proxy must keep an explicit allowlist boundary. |
| Recorded voice files | OpenRouter neural synthesis is the selected delivery path. |
| Scripture TTS contract replacement | Existing passage narration remains stable. |
| Biome discovery and World 1 completion UI | Separate feature slices. |

## User Stories

### P1: Hear the approved Creation story ⭐ MVP

**User Story**: As a child exploring Creation, I want the calm Voice Guide to
introduce and connect each moment so that the world transformations form one
understandable story.

**Acceptance Criteria**:

1. WHEN a new Creation moment becomes active THEN the guide SHALL show its
   localized initial line and SHALL request neural narration when automatic
   reading is enabled by the current age/preference rules.
2. WHEN narration is requested THEN the browser SHALL send only an approved
   narration ID and language, and the server SHALL resolve the exact script.
3. WHEN the OpenRouter request succeeds THEN the client SHALL play the returned
   MP3 using the configured model `x-ai/grok-voice-tts-1.0` and voice `eve`.
4. WHEN neural synthesis fails, times out or is unavailable THEN the client
   SHALL speak the same localized line with the best compatible local voice.
5. WHEN a moment transition is confirmed THEN the outgoing transition line
   SHALL be presented without replaying a stale initial line.

**Independent Test**: Select moments 1 and 2 in `/lab`, enable narration, and
observe the localized bubble and neural/fallback playback sequence.

### P1: Preserve exploration and overlay priority ⭐ MVP

**User Story**: As a child or responsible adult, I want narration to stop when a
blocking flow begins so that two voices or competing instructions never overlap.

**Acceptance Criteria**:

1. WHEN Selah, dialogue, a local panel, onboarding, start screen or parental
   pause becomes active THEN guide playback SHALL cancel and release temporary
   audio immediately.
2. WHEN the region, moment or interface language changes THEN stale synthesis
   requests and playback SHALL cancel before the replacement line starts.
3. WHEN the guide is visible THEN its bubble SHALL remain non-blocking and SHALL
   NOT interrupt movement or pointer lock.
4. WHEN narration is disabled THEN localized text SHALL remain visible without
   issuing a neural synthesis request.

**Independent Test**: Begin narration and activate each blocking overlay while
asserting cancellation, hidden guide content and unchanged exploration state.

### P2: Offer calm support after inactivity

**User Story**: As a child who pauses or loses the path, I want one gentle hint
so that I can continue without punitive or repetitive feedback.

**Acceptance Criteria**:

1. WHEN the engine reports 12 seconds without meaningful movement or interaction
   during active exploration THEN the guide SHALL present the approved support
   line for the current moment.
2. WHEN movement or interaction resumes THEN the inactivity timer SHALL reset.
3. WHEN support has already played for the same inactivity episode THEN it SHALL
   NOT repeat until activity resumes and another 12-second pause occurs.
4. WHEN the current moment has no distinct support line THEN the guide SHALL keep
   the objective visible and SHALL NOT synthesize invented copy.

**Independent Test**: Use fake timers and an activity signal to trigger one
support line, resume movement, and trigger it once again.

### P2: Protect the narration proxy

**User Story**: As the project team, we want guide narration to retain the same
privacy and abuse controls as scripture TTS so that OpenRouter credentials and
unapproved content remain protected.

**Acceptance Criteria**:

1. WHEN a narration ID or language is invalid THEN the proxy SHALL reject it
   before calling OpenRouter.
2. WHEN the endpoint exceeds its timeout or per-IP rate limit THEN it SHALL fail
   closed and allow the browser fallback path.
3. WHEN audio is returned THEN the response SHALL be MP3 with
   `Cache-Control: no-store` and SHALL NOT persist the script or audio.

**Independent Test**: Exercise valid, invalid, timed-out and rate-limited route
requests with a mocked OpenRouter client.

## Edge Cases

- WHEN React Strict Mode repeats effects THEN a line SHALL synthesize at most once
  for the same narration key.
- WHEN a late neural response arrives after cancellation THEN it SHALL be ignored
  and its temporary resource released.
- WHEN the language changes during local fallback speech THEN the previous utterance
  SHALL cancel before the new localized line begins.
- WHEN reduced motion is enabled THEN narration behavior SHALL remain unchanged;
  only visual transitions may be reduced.
- WHEN automatic narration is enabled for a child profile THEN browser autoplay
  restrictions SHALL degrade to visible text without blocking exploration.

## Requirement Traceability

| Requirement ID | Story | Status |
| --- | --- | --- |
| CNARR-01 | P1: localized initial and transition guide lines | Pending |
| CNARR-02 | P1: approved-ID OpenRouter neural synthesis | Pending |
| CNARR-03 | P1: local voice fallback | Pending |
| CNARR-04 | P1: cancellation and overlay priority | Pending |
| CNARR-05 | P1: narration preference and non-blocking text | Pending |
| CNARR-06 | P2: activity-aware support line | Pending |
| CNARR-07 | P2: timeout, rate limit, validation and no-store | Pending |
| CNARR-08 | P2: `/lab` deterministic simulation | Pending |

**Coverage**: 8 total, 0 mapped to tasks, 8 awaiting approved design.

## Success Criteria

- [ ] Moments 1 and 2 demonstrate initial, support and transition narration in
      pt-BR, en-US and es-ES without loading Canvas.
- [ ] The production Creation route cancels narration across every blocking
      overlay and moment/language change.
- [ ] No arbitrary text reaches OpenRouter and no synthesized audio is cached.
- [ ] Lint, full tests, production build and desktop/mobile browser UAT pass.

## Approved Timing Decision

The inactivity threshold is **12 seconds** of no meaningful movement or
interaction. It may be adjusted later only from playtesting evidence.
