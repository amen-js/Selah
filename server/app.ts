import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { buscarPassagemAprovada, type FaixaEtaria, type Idioma } from './data/passagens.ts'
import { loadEnv, type Env } from './env.ts'
import { createMetricsStore, type EventoMetrica, type MetricsStore } from './services/metrics.ts'
import {
  createOpenRouterClient,
  createOpenRouterTtsClient,
  type OpenRouterClient,
  type OpenRouterTtsClient,
} from './services/openrouter.ts'
import { createQuizService, QuizHttpError, type QuizService } from './services/quiz.ts'
import { createQuizSessionStore, type QuizSessionStore } from './services/quizSession.ts'
import { createYouVersionClient, type YouVersionClient } from './services/youversion.ts'

const IDIOMAS: readonly Idioma[] = ['pt-BR', 'en-US', 'es-ES']
const FAIXAS: readonly FaixaEtaria[] = ['crianca', 'geral']
const DIFICULDADES = ['facil', 'medio'] as const
const HISTORIAS = ['criacao', 'noe', 'jose'] as const
const EVENTOS = ['selah_iniciado', 'selah_concluido', 'quiz_respondido'] as const

export interface AppDeps {
  env?: Env
  fetchFn?: typeof fetch
  youVersion?: YouVersionClient
  openRouter?: OpenRouterClient | null
  openRouterTts?: OpenRouterTtsClient | null
  sessoes?: QuizSessionStore
  metrics?: MetricsStore
  quiz?: QuizService
  now?: () => number
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null

const isIdioma = (value: unknown): value is Idioma => IDIOMAS.includes(value as Idioma)
const isFaixa = (value: unknown): value is FaixaEtaria => FAIXAS.includes(value as FaixaEtaria)
const isDificuldade = (value: unknown): value is (typeof DIFICULDADES)[number] =>
  DIFICULDADES.includes(value as (typeof DIFICULDADES)[number])
const isHistoria = (value: unknown): value is (typeof HISTORIAS)[number] =>
  HISTORIAS.includes(value as (typeof HISTORIAS)[number])
const isEvento = (value: unknown): value is EventoMetrica['tipo'] =>
  EVENTOS.includes(value as EventoMetrica['tipo'])

const clientIp = (header: string | undefined): string =>
  header?.split(',')[0]?.trim() || 'local'

const parseEventos = (value: unknown): EventoMetrica[] | null => {
  const body = asRecord(value)
  const eventos = Array.isArray(body?.eventos) ? body.eventos : null
  if (!eventos || eventos.length === 0 || eventos.length > 20) return null

  const parsed: EventoMetrica[] = []
  for (const item of eventos) {
    const evento = asRecord(item)
    const tipo = evento?.tipo
    const historiaId = asString(evento?.historiaId)
    const versaoApp = asString(evento?.versaoApp)
    if (!isEvento(tipo) || !historiaId || !isHistoria(historiaId) || !versaoApp) return null
    if (tipo === 'quiz_respondido' && typeof evento?.acertou !== 'boolean') return null

    const campos = Object.keys(evento ?? {})
    const permitidos =
      tipo === 'quiz_respondido'
        ? ['tipo', 'historiaId', 'versaoApp', 'acertou']
        : ['tipo', 'historiaId', 'versaoApp']
    if (campos.some((campo) => !permitidos.includes(campo))) return null

    parsed.push(
      tipo === 'quiz_respondido'
        ? { tipo, historiaId, versaoApp, acertou: evento?.acertou as boolean }
        : { tipo, historiaId, versaoApp },
    )
  }
  return parsed
}

export const createApp = (deps: AppDeps = {}) => {
  const env = deps.env ?? loadEnv()
  const fetchFn = deps.fetchFn ?? fetch
  const now = deps.now ?? Date.now
  const youVersion =
    deps.youVersion ??
    createYouVersionClient({
      appKey: env.youVersionAppKey,
      bibleIds: env.youVersionBibleIds,
      fetchFn,
    })
  const openRouter =
    deps.openRouter === undefined
      ? env.openRouterApiKey
        ? createOpenRouterClient(env.openRouterApiKey, env.openRouterModels, fetchFn)
        : null
      : deps.openRouter
  const openRouterTts =
    deps.openRouterTts === undefined
      ? env.openRouterApiKey
        ? createOpenRouterTtsClient(
            env.openRouterApiKey,
            env.openRouterTtsModel,
            env.openRouterTtsVoice,
            fetchFn,
          )
        : null
      : deps.openRouterTts
  const sessoes = deps.sessoes ?? createQuizSessionStore(now)
  const metrics = deps.metrics ?? createMetricsStore(now)
  const quiz =
    deps.quiz ??
    createQuizService({
      youVersion,
      openRouter,
      sessoes,
    })
  const ttsRateLimits = new Map<string, { inicio: number; total: number }>()

  const consumirTts = (ip: string): boolean => {
    const instante = now()
    const atual = ttsRateLimits.get(ip)
    if (!atual || instante < atual.inicio || instante - atual.inicio >= 60_000) {
      ttsRateLimits.set(ip, { inicio: instante, total: 1 })
      return true
    }
    if (atual.total >= 10) return false
    atual.total += 1
    return true
  }

  const app = new Hono()

  app.use(
    '*',
    cors({
      origin: env.corsOrigins,
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Accept'],
    }),
  )

  app.use('*', async (context, next) => {
    const started = now()
    await next()
    if (process.env.VITEST === 'true') return
    console.info(
      JSON.stringify({
        method: context.req.method,
        path: context.req.path,
        status: context.res.status,
        durationMs: now() - started,
      }),
    )
  })

  app.get('/health', (context) =>
    context.json({
      status: 'ok',
      ia: Boolean(env.openRouterApiKey),
      modelo: env.openRouterModels[0] ?? null,
      youversion: Boolean(env.youVersionAppKey),
      tts: {
        ativo: Boolean(openRouterTts),
        modelo: env.openRouterTtsModel,
        voz: env.openRouterTtsVoice,
      },
    }),
  )

  app.get('/api/versiculo', async (context) => {
    const passagemId = asString(context.req.query('passagemId'))
    const idioma = context.req.query('idioma')
    if (!passagemId || !isIdioma(idioma)) {
      return context.json({ erro: 'Informe passagemId e idioma válidos.' }, 400)
    }

    const passagem = buscarPassagemAprovada(passagemId)
    if (!passagem) {
      return context.json({ erro: 'Passagem não encontrada na allowlist.' }, 404)
    }

    const versiculo = await youVersion.buscar(passagem.usfm, passagem.passagemId, idioma)
    if (!versiculo) {
      return context.json({ erro: 'Texto indisponível para esta passagem.' }, 503)
    }

    return context.json({
      passagemId: versiculo.passagemId,
      referencia: versiculo.referencia,
      texto: versiculo.texto,
      idioma: versiculo.idioma,
      versao: versiculo.versao,
      atribuicao: versiculo.atribuicao,
      origem: versiculo.origem,
    })
  })

  app.post('/api/tts', async (context) => {
    let body: unknown
    try {
      body = await context.req.json()
    } catch {
      return context.json({ erro: 'JSON inválido.' }, 400)
    }

    const data = asRecord(body)
    const passagemId = asString(data?.passagemId)
    const idioma = data?.idioma
    const campos = Object.keys(data ?? {})
    if (
      !passagemId ||
      !isIdioma(idioma) ||
      campos.length !== 2 ||
      campos.some((campo) => !['passagemId', 'idioma'].includes(campo))
    ) {
      return context.json({ erro: 'Pedido de áudio inválido.' }, 400)
    }

    const passagem = buscarPassagemAprovada(passagemId)
    if (!passagem) {
      return context.json({ erro: 'Passagem não encontrada na allowlist.' }, 404)
    }
    if (!openRouterTts) {
      return context.json({ erro: 'Narração neural indisponível.' }, 503)
    }

    const ip = clientIp(context.req.header('x-forwarded-for') ?? context.req.header('x-real-ip'))
    if (!consumirTts(ip)) {
      return context.json({ erro: 'Limite de narrações excedido. Tente novamente em instantes.' }, 429)
    }

    const versiculo = await youVersion.buscar(passagem.usfm, passagem.passagemId, idioma)
    if (!versiculo) {
      return context.json({ erro: 'Texto indisponível para esta passagem.' }, 503)
    }

    const abortController = new AbortController()
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    try {
      const timeout = new Promise<null>((resolve) => {
        timeoutId = setTimeout(() => {
          abortController.abort()
          resolve(null)
        }, 10_000)
      })
      const audio = await Promise.race([
        openRouterTts.sintetizar(versiculo.texto, abortController.signal),
        timeout,
      ])
      if (!audio) {
        return context.json({ erro: 'Narração neural indisponível.' }, 503)
      }

      return context.body(audio, 200, {
        'Cache-Control': 'no-store',
        'Content-Type': 'audio/mpeg',
      })
    } catch {
      return context.json({ erro: 'Narração neural indisponível.' }, 503)
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId)
    }
  })

  app.post('/api/quiz/gerar', async (context) => {
    let body: unknown
    try {
      body = await context.req.json()
    } catch {
      return context.json({ erro: 'JSON inválido.' }, 400)
    }

    const data = asRecord(body)
    const historiaId = asString(data?.historiaId)
    const passagemId = asString(data?.passagemId)
    const idioma = data?.idioma
    const faixaEtaria = data?.faixaEtaria
    const dificuldade = data?.dificuldade
    const iaAtiva = data?.iaAtiva

    if (
      !historiaId ||
      !isHistoria(historiaId) ||
      !passagemId ||
      !isIdioma(idioma) ||
      !isFaixa(faixaEtaria) ||
      !isDificuldade(dificuldade) ||
      typeof iaAtiva !== 'boolean'
    ) {
      return context.json({ erro: 'Pedido de quiz inválido.' }, 400)
    }

    try {
      const gerado = await quiz.gerar({
        historiaId,
        passagemId,
        idioma,
        faixaEtaria,
        dificuldade,
        iaAtiva,
      })
      return context.json(gerado)
    } catch (error) {
      if (error instanceof QuizHttpError) {
        return context.json({ erro: error.message }, error.status)
      }
      return context.json({ erro: 'Não foi possível gerar o quiz.' }, 500)
    }
  })

  app.post('/api/quiz/responder', async (context) => {
    let body: unknown
    try {
      body = await context.req.json()
    } catch {
      return context.json({ erro: 'JSON inválido.' }, 400)
    }

    const data = asRecord(body)
    const quizId = asString(data?.quizId)
    const alternativaId = asString(data?.alternativaId)
    if (!quizId || !alternativaId) {
      return context.json({ erro: 'Informe quizId e alternativaId.' }, 400)
    }

    try {
      return context.json(quiz.responder(quizId, alternativaId))
    } catch (error) {
      if (error instanceof QuizHttpError) {
        return context.json({ erro: error.message }, error.status)
      }
      return context.json({ erro: 'Não foi possível avaliar o quiz.' }, 500)
    }
  })

  app.post('/api/metricas/eventos', async (context) => {
    let body: unknown
    try {
      body = await context.req.json()
    } catch {
      return context.json({ erro: 'JSON inválido.' }, 400)
    }

    const eventos = parseEventos(body)
    if (!eventos) {
      return context.json({ erro: 'Lote de eventos inválido.' }, 400)
    }

    const ip = clientIp(context.req.header('x-forwarded-for') ?? context.req.header('x-real-ip'))
    const resultado = metrics.registrar(ip, eventos)
    if (!resultado.aceito) {
      return context.json({ erro: 'Limite de eventos excedido. Tente novamente em instantes.' }, 429)
    }

    return context.body(null, 204)
  })

  return app
}
