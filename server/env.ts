import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const loadDotEnv = (): void => {
  try {
    const text = readFileSync(resolve(process.cwd(), '.env'), 'utf8')
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq < 1) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '')
      if (process.env[key] === undefined) process.env[key] = value
    }
  } catch {
    // .env is optional
  }
}

loadDotEnv()

export interface Env {
  port: number
  openRouterApiKey: string
  openRouterModels: string[]
  openRouterTtsModel: string
  openRouterTtsVoice: string
  youVersionAppKey: string
  youVersionBibleIds: Record<'pt-BR' | 'en-US' | 'es-ES', number>
  corsOrigins: string[]
}

const parseCsv = (value: string | undefined, fallback: string[]): string[] =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    : fallback

const parseBibleId = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export const loadEnv = (): Env => ({
  port: Number(process.env.PORT) || 8787,
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? '',
  openRouterModels: parseCsv(process.env.OPENROUTER_MODELS, [
    'openai/gpt-4o-mini',
    'google/gemini-2.5-flash',
  ]),
  openRouterTtsModel: process.env.OPENROUTER_TTS_MODEL ?? 'x-ai/grok-voice-tts-1.0',
  openRouterTtsVoice: process.env.OPENROUTER_TTS_VOICE ?? 'eve',
  youVersionAppKey: process.env.YVP_APP_KEY ?? '',
  youVersionBibleIds: {
    // IDs licenciados nesta app key (NVI 129/128 retornam 403).
    'pt-BR': parseBibleId(process.env.YOUVERSION_BIBLE_PT, 3254),
    'en-US': parseBibleId(process.env.YOUVERSION_BIBLE_EN, 3034),
    'es-ES': parseBibleId(process.env.YOUVERSION_BIBLE_ES, 3291),
  },
  corsOrigins: parseCsv(process.env.CORS_ORIGINS, [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]),
})
