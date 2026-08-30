// @vitest-environment node
import { createOpenRouterClient, createOpenRouterTtsClient } from './openrouter.ts'

interface CapturedRequest {
  url: string
  headers: Headers
  body: Record<string, unknown>
}

describe('OpenRouter client', () => {
  it('retries JSON Object with the same privacy controls when JSON Schema is rejected', async () => {
    const quizGerado = {
      pergunta: 'O que Deus disse para que houvesse luz?',
      alternativas: [
        { id: 'A' as const, texto: 'Haja luz' },
        { id: 'B' as const, texto: 'Haja uma cidade' },
        { id: 'C' as const, texto: 'Haja um palácio' },
        { id: 'D' as const, texto: 'Haja uma torre' },
      ],
      respostaCorretaId: 'A' as const,
      explicacao: 'Deus disse haja luz e houve luz.',
    }
    const requests: CapturedRequest[] = []
    const fetchFn: typeof fetch = vi.fn(async (input, init) => {
      const request = new Request(input, init)
      const body = (await request.clone().json()) as Record<string, unknown>
      requests.push({ url: request.url, headers: request.headers, body })

      const responseFormat = body.response_format as Record<string, unknown> | undefined
      if (responseFormat?.type === 'json_schema') {
        return new Response(
          JSON.stringify({ error: { message: 'JSON Schema não suportado por este modelo.' } }),
          { status: 400, headers: { 'content-type': 'application/json' } },
        )
      }

      return new Response(
        JSON.stringify({
          id: 'chatcmpl-selah',
          object: 'chat.completion',
          created: 1,
          model: 'openai/gpt-4o-mini',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: `\`\`\`json\n${JSON.stringify(quizGerado)}\n\`\`\``,
              },
              finish_reason: 'stop',
            },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      )
    })
    const client = createOpenRouterClient(
      'test-openrouter-key',
      ['openai/gpt-4o-mini'],
      fetchFn,
    )

    const result = await client.gerarQuiz({
      referencia: 'Gênesis 1:3',
      texto: 'E disse Deus: Haja luz. E houve luz.',
      idioma: 'pt-BR',
      faixaEtaria: 'crianca',
      dificuldade: 'facil',
    })

    expect(result).toEqual(quizGerado)
    expect(fetchFn).toHaveBeenCalledTimes(2)
    expect(requests).toHaveLength(2)

    expect(requests[0]?.url).toBe('https://openrouter.ai/api/v1/chat/completions')
    expect(requests[0]?.body.model).toBe('openai/gpt-4o-mini')
    expect(requests[0]?.body.response_format).toEqual({
      type: 'json_schema',
      json_schema: expect.objectContaining({ name: 'quiz', strict: true }),
    })
    expect(requests[1]?.url).toBe('https://openrouter.ai/api/v1/chat/completions')
    expect(requests[1]?.body.model).toBe('openai/gpt-4o-mini')
    expect(requests[1]?.body.response_format).toEqual({ type: 'json_object' })

    for (const request of requests) {
      expect(request.body.provider).toEqual({
        data_collection: 'deny',
        zdr: true,
        allow_fallbacks: true,
      })
      expect(request.headers.get('authorization')).toBe('Bearer test-openrouter-key')
      expect(request.headers.get('http-referer')).toBe('https://selah.local')
      expect(request.headers.get('x-title')).toBe('Selah')
    }
  })

  it('synthesizes MP3 speech without applying the quiz ZDR provider filter', async () => {
    const requests: CapturedRequest[] = []
    const audio = new Uint8Array([73, 68, 51, 4])
    const fetchFn: typeof fetch = vi.fn(async (input, init) => {
      const request = new Request(input, init)
      requests.push({
        url: request.url,
        headers: request.headers,
        body: (await request.clone().json()) as Record<string, unknown>,
      })
      return new Response(audio, {
        status: 200,
        headers: { 'content-type': 'audio/mpeg' },
      })
    })
    const client = createOpenRouterTtsClient(
      'test-openrouter-key',
      'x-ai/grok-voice-tts-1.0',
      'eve',
      fetchFn,
    )

    const result = await client.sintetizar('E disse Deus: Haja luz.')

    expect(new Uint8Array(result ?? new ArrayBuffer(0))).toEqual(audio)
    expect(requests).toHaveLength(1)
    expect(requests[0]?.url).toBe('https://openrouter.ai/api/v1/audio/speech')
    expect(requests[0]?.body).toEqual({
      model: 'x-ai/grok-voice-tts-1.0',
      voice: 'eve',
      input: 'E disse Deus: Haja luz.',
      response_format: 'mp3',
    })
    expect(requests[0]?.body).not.toHaveProperty('provider')
    expect(requests[0]?.headers.get('authorization')).toBe('Bearer test-openrouter-key')
    expect(requests[0]?.headers.get('http-referer')).toBe('https://selah.local')
    expect(requests[0]?.headers.get('x-title')).toBe('Selah')
  })

  it('fails closed when speech synthesis is not configured or the provider rejects it', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'unavailable' } }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      }),
    )

    await expect(
      createOpenRouterTtsClient('', 'x-ai/grok-voice-tts-1.0', 'eve', fetchFn).sintetizar(
        'Haja luz.',
      ),
    ).resolves.toBeNull()
    expect(fetchFn).not.toHaveBeenCalled()

    await expect(
      createOpenRouterTtsClient(
        'test-key',
        'x-ai/grok-voice-tts-1.0',
        'eve',
        fetchFn,
      ).sintetizar('Haja luz.'),
    ).resolves.toBeNull()
  })
})
