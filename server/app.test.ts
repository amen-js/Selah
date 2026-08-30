// @vitest-environment node
import { createApp } from './app.ts'
import { loadEnv } from './env.ts'
import type { OpenRouterClient, OpenRouterTtsClient } from './services/openrouter.ts'

const json = async (response: Response) => (await response.json()) as Record<string, unknown>

const gerarBody = {
  historiaId: 'criacao',
  passagemId: 'genesis-1-3',
  idioma: 'pt-BR',
  faixaEtaria: 'crianca',
  dificuldade: 'facil',
  iaAtiva: false,
}

describe('Selah API proxy', () => {
  const env = {
    ...loadEnv(),
    openRouterApiKey: '',
    youVersionAppKey: '',
    youVersionBibleIds: {
      'pt-BR': 3254,
      'en-US': 3034,
      'es-ES': 3291,
    },
  }

  it('returns an approved verse from the public-domain snapshot', async () => {
    const app = createApp({ env })
    const response = await app.request('/api/versiculo?passagemId=genesis-1-3&idioma=pt-BR')
    expect(response.status).toBe(200)
    await expect(json(response)).resolves.toMatchObject({
      passagemId: 'genesis-1-3',
      referencia: 'Gênesis 1:3',
      texto: 'E disse Deus: Haja luz. E houve luz.',
      idioma: 'pt-BR',
    })
  })

  it('returns localized neural verse audio with no-store headers', async () => {
    const audio = new Uint8Array([73, 68, 51, 4]).buffer
    const sintetizar = vi.fn<OpenRouterTtsClient['sintetizar']>().mockResolvedValue(audio)
    const app = createApp({ env, openRouterTts: { sintetizar } })

    const response = await app.request('/api/tts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ passagemId: 'genesis-1-3', idioma: 'es-ES' }),
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('audio/mpeg')
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array(audio))
    expect(sintetizar).toHaveBeenCalledOnce()
    expect(sintetizar.mock.calls[0]?.[0]).toBe('Y dijo Dios: Sea la luz; y fue la luz.')
    expect(sintetizar.mock.calls[0]?.[1]).toBeInstanceOf(AbortSignal)
  })

  it('rejects invalid or non-allowlisted TTS requests before synthesis', async () => {
    const sintetizar = vi.fn<OpenRouterTtsClient['sintetizar']>()
    const app = createApp({ env, openRouterTts: { sintetizar } })

    const invalid = await app.request('/api/tts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        passagemId: 'genesis-1-3',
        idioma: 'pt-BR',
        texto: 'Conteúdo arbitrário',
      }),
    })
    const unknown = await app.request('/api/tts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ passagemId: 'jonah-1-1', idioma: 'pt-BR' }),
    })

    expect(invalid.status).toBe(400)
    expect(unknown.status).toBe(404)
    expect(sintetizar).not.toHaveBeenCalled()
  })

  it('returns 503 when neural speech is not configured or times out', async () => {
    const unavailable = createApp({ env, openRouterTts: null })
    const missing = await unavailable.request('/api/tts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ passagemId: 'genesis-1-3', idioma: 'pt-BR' }),
    })
    expect(missing.status).toBe(503)

    vi.useFakeTimers()
    try {
      const sintetizar: OpenRouterTtsClient['sintetizar'] = (_texto, signal) =>
        new Promise((resolve) => signal?.addEventListener('abort', () => resolve(null)))
      const timedApp = createApp({ env, openRouterTts: { sintetizar } })
      const pending = timedApp.request('/api/tts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ passagemId: 'genesis-1-3', idioma: 'pt-BR' }),
      })

      await vi.advanceTimersByTimeAsync(10_000)
      expect((await pending).status).toBe(503)
    } finally {
      vi.useRealTimers()
    }
  })

  it('rate limits TTS synthesis after ten requests per IP in one minute', async () => {
    const sintetizar = vi
      .fn<OpenRouterTtsClient['sintetizar']>()
      .mockResolvedValue(new Uint8Array([1]).buffer)
    const app = createApp({ env, openRouterTts: { sintetizar } })
    const request = () =>
      app.request('/api/tts', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '203.0.113.15',
        },
        body: JSON.stringify({ passagemId: 'genesis-1-3', idioma: 'pt-BR' }),
      })

    for (let index = 0; index < 10; index += 1) {
      expect((await request()).status).toBe(200)
    }
    expect((await request()).status).toBe(429)
    expect(sintetizar).toHaveBeenCalledTimes(10)
  })

  it('rejects passages outside the allowlist', async () => {
    const app = createApp({ env })
    const response = await app.request('/api/versiculo?passagemId=jonah-1-1&idioma=pt-BR')
    expect(response.status).toBe(404)
  })

  it('returns a fallback quiz without exposing the answer key', async () => {
    const app = createApp({ env, openRouter: null })
    const response = await app.request('/api/quiz/gerar', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(gerarBody),
    })
    expect(response.status).toBe(200)
    const body = await json(response)
    expect(body).toMatchObject({
      passagemId: 'genesis-1-3',
      origem: 'fallback',
    })
    expect(body).not.toHaveProperty('respostaCorretaId')
    expect(body).not.toHaveProperty('explicacao')
    expect(Array.isArray(body.alternativas)).toBe(true)
    expect((body.alternativas as unknown[]).length).toBe(4)
  })

  it('grades only quizId and alternativaId', async () => {
    const app = createApp({ env, openRouter: null })
    const gerado = await json(
      await app.request('/api/quiz/gerar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(gerarBody),
      }),
    )

    const alternativas = gerado.alternativas as { id: string; texto: string }[]
    const correta = alternativas.find((item) => item.texto === 'Houve luz')
    const errada = alternativas.find((item) => item.texto !== 'Houve luz')
    expect(correta?.id).toBeDefined()
    expect(errada?.id).toBeDefined()

    const acerto = await app.request('/api/quiz/responder', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ quizId: gerado.id, alternativaId: correta?.id }),
    })
    expect(acerto.status).toBe(200)
    await expect(json(acerto)).resolves.toMatchObject({ acertou: true, referencia: 'Gênesis 1:3' })

    const erro = await app.request('/api/quiz/responder', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ quizId: gerado.id, alternativaId: errada?.id }),
    })
    await expect(json(erro)).resolves.toMatchObject({ acertou: false })
  })

  it('uses a validated LLM quiz when IA is enabled', async () => {
    const openRouter: OpenRouterClient = {
      gerarQuiz: async () => ({
        pergunta: 'O que Deus fez existir?',
        alternativas: [
          { id: 'A', texto: 'A luz' },
          { id: 'B', texto: 'Uma cidade' },
          { id: 'C', texto: 'Um palácio' },
          { id: 'D', texto: 'Uma torre' },
        ],
        respostaCorretaId: 'A',
        explicacao: 'Deus disse haja luz e houve luz.',
      }),
    }
    const app = createApp({ env, openRouter })
    const response = await app.request('/api/quiz/gerar', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...gerarBody, iaAtiva: true }),
    })
    const body = await json(response)
    expect(body.origem).toBe('ia')
    expect(body).not.toHaveProperty('respostaCorretaId')
  })

  it('grounds the LLM quiz in live YouVersion text', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          content: 'Deus disse: “Haja luz e houve luz”.',
          reference: 'Gênesis 1:3',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )
    const gerarQuiz = vi.fn(async (input: { texto: string; referencia: string }) => {
      expect(input.referencia).toBe('Gênesis 1:3')
      expect(input.texto).toContain('Haja luz')
      return {
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
    })
    const app = createApp({
      env: { ...env, youVersionAppKey: 'test-key' },
      fetchFn,
      openRouter: { gerarQuiz },
    })
    const body = await json(
      await app.request('/api/quiz/gerar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...gerarBody, iaAtiva: true }),
      }),
    )
    expect(body.origem).toBe('ia')
    expect(gerarQuiz).toHaveBeenCalledOnce()
    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining('/bibles/3254/passages/GEN.1.3'),
      expect.anything(),
    )
  })

  it('falls back when the LLM output fails closed', async () => {
    const openRouter: OpenRouterClient = {
      gerarQuiz: async () => ({
        pergunta: 'Quem construiu a arca?',
        alternativas: [
          { id: 'A', texto: 'Noé' },
          { id: 'B', texto: 'José' },
          { id: 'C', texto: 'Faraó' },
          { id: 'D', texto: 'Daniel' },
        ],
        respostaCorretaId: 'A',
        explicacao: 'Noé construiu a arca no Egito.',
      }),
    }
    const app = createApp({ env, openRouter })
    const body = await json(
      await app.request('/api/quiz/gerar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...gerarBody, iaAtiva: true }),
      }),
    )
    expect(body.origem).toBe('fallback')
  })

  it('stores only aggregate metric events and rejects extra fields', async () => {
    const app = createApp({ env })
    const ok = await app.request('/api/metricas/eventos', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.10' },
      body: JSON.stringify({
        eventos: [{ tipo: 'selah_iniciado', historiaId: 'criacao', versaoApp: 'dev' }],
      }),
    })
    expect(ok.status).toBe(204)

    const recusado = await app.request('/api/metricas/eventos', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        eventos: [
          {
            tipo: 'selah_iniciado',
            historiaId: 'criacao',
            versaoApp: 'dev',
            criancaId: 'nao-pode',
          },
        ],
      }),
    })
    expect(recusado.status).toBe(400)
  })

  it('uses live YouVersion text when the app key is present', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          content: 'God said, Let there be light, and there was light.',
          reference: 'Genesis 1:3',
          copyright: 'Berean Standard Bible. Public domain.',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )
    const app = createApp({
      env: { ...env, youVersionAppKey: 'test-key' },
      fetchFn,
    })
    const body = await json(
      await app.request('/api/versiculo?passagemId=genesis-1-3&idioma=en-US'),
    )
    expect(body.texto).toContain('Let there be light')
    expect(body.atribuicao).toContain('Berean Standard Bible')
    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining('/bibles/3034/passages/GEN.1.3'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-YVP-App-Key': 'test-key' }),
      }),
    )
  })

  it('requests the licensed Portuguese YouVersion bible', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          content: 'Deus disse: “Haja luz e houve luz”.',
          reference: 'Gênesis 1:3',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )
    const app = createApp({
      env: { ...env, youVersionAppKey: 'test-key' },
      fetchFn,
    })
    const body = await json(
      await app.request('/api/versiculo?passagemId=genesis-1-3&idioma=pt-BR'),
    )
    expect(body.origem).toBe('youversion')
    expect(body.versao).toBe('Bíblia Livre Para Todos')
    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining('/bibles/3254/passages/GEN.1.3'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-YVP-App-Key': 'test-key' }),
      }),
    )
  })
})
