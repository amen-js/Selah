# Creation OpenRouter Narration Design

**Spec**: `.specs/features/dev3-creation-openrouter-narration/spec.md`
**Context**: `.specs/features/dev3-creation-openrouter-narration/context.md`
**Status**: Draft for approval

## Architecture Overview

The feature adds a second, strictly allowlisted use of the existing speech
adapter. Approved narration content is a pure shared catalogue: the browser uses
it for the visible line and local fallback, while the server independently
resolves the requested ID before calling OpenRouter.

```text
ProgressaoCriacaoRuntime
  ├─ onMomentoChange ───────────────┐
  └─ onInatividadeChange (12 s) ────┤
                                    v
GameCanvas -> App transient state -> GameOverlay
                                      |
                                      v
                              useCreationNarration
                                ├─ CreationGuide text
                                └─ TtsController.narrar
                                      |
                                      v
                         POST /api/tts/narracao
                                      |
                     resolve approved ID + language
                                      |
                                      v
                        OpenRouterTtsClient.sintetizar
```

No narration progress enters Zustand or `localStorage`.

## Code Reuse Analysis

| Existing component | Location | Reuse |
| --- | --- | --- |
| OpenRouter speech adapter | `server/services/openrouter.ts` | Keep model, voice, MP3 output and SDK call unchanged. |
| Protected scripture route | `server/app.ts` | Reuse timeout, shared rate budget and no-store response pattern without changing `/api/tts`. |
| Browser TTS controller | `src/services/tts.ts` | Reuse playback, abort, object URL cleanup, pause/resume and local voice selection. |
| Creation progression runtime | `src/components/game/creation/progression/ProgressaoCriacaoRuntime.tsx` | Reuse the existing player-position frame loop to detect meaningful activity. |
| Creation Guide | `src/components/game/CreationGuide.tsx` | Remain the passive, pointer-transparent visual leaf. |
| Overlay priority | `src/components/game/GameOverlay.tsx` | Reuse the existing Selah, pause, dialogue and panel gates. |
| Creation UI catalogue | `src/components/game/creationJourneyUi.ts` | Keep titles/objectives as the steady fallback between narrated lines. |

## Components and Interfaces

### Approved Creation narration catalogue

- **Location**: `src/content/creationNarrations.ts`
- **Purpose**: Be the single editorial source for the 27 approved narration
  IDs and their pt-BR, en-US and es-ES scripts.
- **Constraint**: The module is pure TypeScript with no React, DOM, environment
  or server dependency so both runtimes can import it safely.
- **Interfaces**:

```ts
type FaseNarracaoCriacao = 'inicial' | 'apoio' | 'transicao'
type NarracaoCriacaoId = `criacao.${MomentoCriacaoId}.${FaseNarracaoCriacao}`

interface NarracaoCriacaoResolvida {
  narracaoId: NarracaoCriacaoId
  momentoId: MomentoCriacaoId
  fase: FaseNarracaoCriacao
  idioma: Idioma
  texto: string
}

function buscarNarracaoCriacao(
  narracaoId: string,
  idioma: string,
): NarracaoCriacaoResolvida | undefined
```

- **Repository convention**: `src/content/` will contain approved narrative
  catalogues that are safe to share with the browser and proxy.

### Protected guide narration route

- **Location**: `server/app.ts`
- **Endpoint**: `POST /api/tts/narracao`
- **Request**: exactly `{ narracaoId, idioma }`.
- **Behavior**:
  - reject malformed/extra fields before synthesis;
  - resolve the exact script from the approved catalogue;
  - share the existing ten-per-minute/IP TTS budget;
  - reuse the ten-second abort timeout;
  - return MP3 with `Cache-Control: no-store`;
  - leave `/api/tts` and `OpenRouterTtsClient` unchanged.

### TtsController narration method

- **Location**: `src/services/tts.ts`
- **Interface**:

```ts
interface NarracaoTtsInput {
  narracaoId: NarracaoCriacaoId
  idioma: Idioma
  textoFallback: string
}

interface TtsController {
  falar(versiculo: VersiculoPublico): Promise<void>
  narrar(narracao: NarracaoTtsInput): Promise<void>
  // existing state, subscription and controls remain unchanged
}
```

- **Network boundary**: `textoFallback` never enters the request body; only the
  ID and language reach the proxy.
- **Playback**: both methods use the same single active operation, ensuring
  scripture and guide voices cannot overlap.

### Creation inactivity detector

- **Locations**:
  - pure state helper beside the Creation progression runtime;
  - runtime integration in `ProgressaoCriacaoRuntime.tsx`.
- **Interface**:

```ts
interface EstadoInatividadeCriacao {
  ultimaAtividadeMs: number
  posicaoAnterior: PosicaoJogador | null
  inativo: boolean
}

function atualizarInatividadeCriacao(
  estado: EstadoInatividadeCriacao,
  entrada: { agoraMs: number; posicao: PosicaoJogador; enabled: boolean },
): { estado: EstadoInatividadeCriacao; mudouPara: boolean | null }
```

- **Rules**:
  - meaningful horizontal displacement resets the timer;
  - 12,000 ms without displacement emits `true` once;
  - resumed movement emits `false` once;
  - disabled exploration and moment changes reset the episode;
  - callbacks occur only on state transitions, avoiding frame-rate React updates.

### Transient Canvas-to-DOM inactivity contract

- **Locations**: `GameCanvas.tsx`, `App.tsx`.
- **Interface**:
  `onInatividadeCriacaoChange?: (inativo: boolean) => void`.
- **Behavior**: App stores one transient boolean, forwards it to `GameOverlay`
  and clears it outside Creation. No persistent state changes.

### useCreationNarration

- **Location**: `src/hooks/useCreationNarration.ts`
- **Inputs**: snapshot, inactivity boolean, effective overlay activity and the
  injected TTS controller.
- **Output**:

```ts
interface LinhaGuiaCriacao {
  fase: 'objetivo' | FaseNarracaoCriacao
  texto: string
  narracaoId?: NarracaoCriacaoId
}
```

- **State flow**:

```text
first moment: initial -> objective
moment change: previous transition -> current initial -> objective
12 s inactive: support -> objective
activity resumes: reset support episode
blocking overlay/language/region change: cancel and invalidate pending work
```

- **Silent timing**: when automatic narration is disabled, narrated lines use a
  deterministic four-second dwell before advancing.
- **Spoken timing**: when enabled, transition/initial sequencing waits for the
  TTS controller to reach a terminal state.
- **Strict Mode**: neural requests begin on a zero-delay timer. The throwaway
  Strict Mode effect is cleaned before the timer fires, preventing duplicate
  synthesis.

### CreationGuide and GameOverlay composition

- `GameOverlay` computes one effective guide-active flag before its overlay
  branches and owns `useCreationNarration`.
- `CreationGuide` receives the resolved line and remains a side-effect-free,
  non-interactive live region.
- The stable objective remains visible between narrative lines.
- Selah, parental pause, dialogue, panels and inactive exploration immediately
  deactivate and cancel guide narration.

### Laboratory simulation

- **Location**: `src/lab/LabPage.tsx`
- **Behavior**: retain the moment selector and add deterministic activity/support
  simulation using the same production overlay and an injectable TTS controller.
- **Constraint**: no Canvas or real OpenRouter request is required for tests.

## Error Handling Strategy

| Scenario | Handling | User impact |
| --- | --- | --- |
| Invalid ID/language/extra request field | Reject before adapter call | Visible text remains; local fallback is available. |
| OpenRouter missing, timeout, rejection or empty audio | Return 503; controller starts local speech | Narration continues with device voice when supported. |
| Neural response arrives after cancellation | Ignore operation and release temporary audio | No stale voice overlaps the current flow. |
| Browser autoplay rejects playback | Fall back locally; otherwise return to objective | Exploration never blocks. |
| Rate budget exceeded | Return 429; use local fallback | Repeated support cannot spend unbounded requests. |
| Current moment lacks a line | Keep objective and issue no request | No invented content. |

## Privacy and Security Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Public synthesis input | Approved ID + language only | Prevents arbitrary proxy use and unreviewed child-facing speech. |
| Audio persistence | None; `no-store` and temporary object URLs | Matches the existing TTS privacy contract. |
| Rate limit | Shared with scripture TTS | Prevents separate endpoints from multiplying the budget. |
| OpenRouter provider policy | Reuse the current speech adapter unchanged | The selected Grok voice is not currently exposed through a strict-ZDR speech endpoint; only static, approved, non-personal scripts are sent. Quiz ZDR behavior is unchanged. |
| Logs | Method/path/status/duration only | Narration text, ID, language and audio are not logged. |

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Long scripts exceed two mobile lines | Preserve the full accessible script and verify wrapping in UAT; editorial segmentation is a follow-up if two visual lines prove strict. Do not line-clamp approved copy. |
| Existing “toque” wording differs from proximity gameplay | Keep the GDD-approved copy for this slice and flag editorial alignment separately. |
| Initial + transition + support consume rate budget | One request per line key/episode, shared limiter and no support repetition before activity. |
| Guide cleanup races Selah narration | Single controller, overlay gating and cleanup before the Selah speech effect starts. |
| Position jitter prevents inactivity | Pure detector uses a meaningful horizontal displacement threshold and browser UAT. |
| Shared content enters both builds | Module contains only public approved strings and types; no secrets or runtime imports. |

## Validation Strategy

- Catalogue unit tests: exactly 27 IDs, all three languages and non-empty text.
- Route tests: allowlist resolution, strict body validation, shared rate limit,
  timeout, failure and no-store MP3 response.
- Controller tests: ID-only request, exact local fallback, late response cleanup
  and scripture contract regression.
- Detector tests: 11,999/12,000 ms boundary, once per episode, movement reset and
  disabled reset.
- Hook tests with fake timers: Strict Mode deduplication, transition queue,
  inactivity support, preference gating and cancellation matrix.
- RTL integration: passive guide, overlay priority and no pointer-lock/storage
  regression.
- `/lab` desktop/mobile UAT in all three languages, including long scripts and
  neural failure fallback.
