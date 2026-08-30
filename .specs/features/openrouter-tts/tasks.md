# OpenRouter TTS Tasks

**Design:** `.specs/features/openrouter-tts/design.md`
**Status:** In Progress
**Baseline:** 30 files, 125 tests passing

## Execution plan

`T1 -> T2 -> T3 -> T4 -> T5`

### T1: Add OpenRouter speech adapter and configuration

**Status:** Complete
**What:** Add the independent TTS adapter, environment defaults, and unit tests.
**Where:** `server/services/openrouter.ts`, `server/env.ts`, `.env.example`, adapter tests.
**Depends on:** None
**Requirement:** TTS-01, TTS-07
**Tests:** Unit
**Gate:** Quick
**Tools:** Built-in filesystem/shell; `tlc-spec-driven`.

**Done when:** speech requests use Grok/Eve/MP3, share OpenRouter headers, and
quiz requests retain their existing ZDR payload.

### T2: Expose the protected TTS route

**Status:** Complete
**What:** Add `POST /api/tts`, health status, timeout, rate limit, and route tests.
**Where:** `server/app.ts`, `server/app.test.ts`.
**Depends on:** T1
**Requirement:** TTS-01, TTS-02, TTS-07
**Tests:** Integration
**Gate:** Full
**Tools:** Built-in filesystem/shell; `tlc-spec-driven`.

**Done when:** only approved localized scripture reaches the adapter and all
documented status codes and headers are covered.

### T3: Replace the browser-only TTS controller

**Status:** Pending
**What:** Implement neural playback, observable state, cleanup, and local voice fallback.
**Where:** `src/services/tts.ts`, `src/services/tts.test.ts`.
**Depends on:** T2
**Requirement:** TTS-02, TTS-03, TTS-04, TTS-05
**Tests:** Unit
**Gate:** Quick
**Tools:** Built-in filesystem/shell; `tlc-spec-driven`.

**Done when:** play/pause/resume/cancel and stale request handling are deterministic
and local voice selection respects the verse language.

### T4: Integrate narration state with Selah UI and ambience

**Status:** Pending
**What:** Drive localized controls from TTS state and duck ambient audio during playback.
**Where:** overlay, translations, game store/audio hook, and their tests.
**Depends on:** T3
**Requirement:** TTS-02, TTS-04, TTS-05, TTS-06
**Tests:** Integration (RTL)
**Gate:** Full
**Tools:** Built-in filesystem/shell; `tlc-spec-driven`.

**Done when:** automatic/manual narration, language replacement, accessible labels,
disclosure, and volume restoration are verified.

### T5: Validate and document completion

**Status:** Pending
**What:** Run the full gate and update traceability/task status.
**Where:** `.specs/features/openrouter-tts/`.
**Depends on:** T4
**Requirement:** TTS-01 through TTS-07
**Tests:** Build
**Gate:** Build
**Tools:** Built-in filesystem/shell; `tlc-spec-driven`.

**Done when:** lint, all tests, and production build pass with no skipped/deleted tests.

## Validation checks

| Task | Depends on | Diagram | Status |
| --- | --- | --- | --- |
| T1 | None | Start | Match |
| T2 | T1 | T1 -> T2 | Match |
| T3 | T2 | T2 -> T3 | Match |
| T4 | T3 | T3 -> T4 | Match |
| T5 | T4 | T4 -> T5 | Match |

| Task | Layer | Required | Declared | Status |
| --- | --- | --- | --- | --- |
| T1 | Server service/config | Unit/build | Unit | OK |
| T2 | HTTP route | Integration | Integration | OK |
| T3 | Client service | Unit | Unit | OK |
| T4 | Store/hook/component | Unit/integration | Integration | OK |
| T5 | Release gate | Build | Build | OK |
