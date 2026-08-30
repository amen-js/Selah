# OpenRouter TTS Design

**Spec:** `.specs/features/openrouter-tts/spec.md`
**Status:** Verified

## Architecture

The browser sends only `{ passagemId, idioma }` to `POST /api/tts`. The proxy
validates both values, resolves the approved verse through the existing
YouVersion client, and sends only its text to OpenRouter's speech endpoint. The
client plays the returned MP3 in memory and falls back to Web Speech when the
request or playback fails.

## Reuse and isolation

- Keep the existing quiz-only `OpenRouterClient` interface unchanged.
- Add a narrow `OpenRouterTtsClient` beside it, reusing the SDK base URL,
  headers, API key, and injectable `fetch` construction.
- Keep `provider.zdr: true` scoped to chat quiz requests; do not attach it to
  Grok speech requests.
- Reuse `buscarPassagemAprovada`, `YouVersionClient`, `VersiculoPublico`, the
  current overlay, translations, and Howler ambience hook.

## Interfaces

```ts
interface OpenRouterTtsClient {
  sintetizar(texto: string, signal?: AbortSignal): Promise<ArrayBuffer | null>
}

type TtsEstado = 'idle' | 'loading' | 'playing' | 'paused' | 'fallback' | 'error'

interface TtsController {
  suportado: boolean
  estado(): TtsEstado
  assinar(listener: (estado: TtsEstado) => void): () => void
  falar(versiculo: VersiculoPublico): Promise<void>
  pausar(): void
  retomar(): void
  cancelar(): void
}
```

## Failure handling

| Scenario | Behavior |
| --- | --- |
| Invalid passage/language/body | `400` or `404`; no provider call |
| More than 10 requests/IP/minute | `429` |
| Missing TTS configuration | `503` |
| YouVersion/OpenRouter failure or 10s timeout | `503`; browser fallback |
| Stale language/passage request | Abort and ignore its result |
| Neural playback rejection | Release MP3 and use local voice |

## Decisions

- Use MP3, `Cache-Control: no-store`, and no server/client audio cache.
- Use native `Audio` for the short generated clip; no new dependency.
- Prefer local voices whose names contain Natural, Neural, Enhanced, or Premium,
  then any exact/base-language match.
- Use rate `1.02` and pitch `1.05` only for the local fallback.
