import type {
  AvaliacaoQuiz,
  EventoMetrica,
  GerarQuizInput,
  GatilhoSelah,
  Idioma,
  QuizPublico,
  ResponderQuizInput,
  VersiculoPublico,
} from '../types/selah'

export interface SelahGateway {
  buscarVersiculo: (gatilho: GatilhoSelah, idioma: Idioma) => Promise<VersiculoPublico>
  gerarQuiz: (input: GerarQuizInput) => Promise<QuizPublico>
  responderQuiz: (input: ResponderQuizInput) => Promise<AvaliacaoQuiz>
  enviarMetricas: (eventos: EventoMetrica[], consentimento: boolean) => Promise<void>
}

interface GatewayOptions {
  baseUrl?: string
  fetchFn?: typeof fetch
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value : null

const parseVersiculo = (value: unknown): VersiculoPublico => {
  const data = asRecord(value)
  const passagemId = asString(data?.passagemId)
  const referencia = asString(data?.referencia)
  const texto = asString(data?.texto)
  const idioma = data?.idioma
  const versao = asString(data?.versao)
  const atribuicao = asString(data?.atribuicao)

  if (
    !passagemId ||
    !referencia ||
    !texto ||
    !versao ||
    !atribuicao ||
    !['pt-BR', 'en-US', 'es-ES'].includes(String(idioma))
  ) {
    throw new Error('A API não retornou um versículo válido.')
  }

  return {
    passagemId,
    referencia,
    texto,
    idioma: idioma as Idioma,
    versao,
    atribuicao,
  }
}

const parseQuiz = (value: unknown): QuizPublico => {
  const data = asRecord(value)
  const id = asString(data?.id)
  const passagemId = asString(data?.passagemId)
  const pergunta = asString(data?.pergunta)
  const origem = data?.origem
  const alternativas = Array.isArray(data?.alternativas) ? data.alternativas : []
  const alternativasPublicas = alternativas.map((item) => {
    const alternativa = asRecord(item)
    return { id: alternativa?.id, texto: asString(alternativa?.texto) }
  })
  const ids = alternativasPublicas.map(({ id }) => id)
  const idsValidos = ['A', 'B', 'C', 'D']

  if (
    !id ||
    !passagemId ||
    !pergunta ||
    !['ia', 'fallback'].includes(String(origem)) ||
    alternativasPublicas.length !== 4 ||
    ids.some((id) => !idsValidos.includes(String(id))) ||
    new Set(ids).size !== 4 ||
    alternativasPublicas.some(({ texto }) => !texto)
  ) {
    throw new Error('A API não retornou um quiz válido.')
  }

  return {
    id,
    passagemId,
    pergunta,
    alternativas: alternativasPublicas.map(({ id, texto }) => ({
      id: id as 'A' | 'B' | 'C' | 'D',
      texto: texto as string,
    })),
    origem: origem as 'ia' | 'fallback',
  }
}

const parseAvaliacao = (value: unknown): AvaliacaoQuiz => {
  const data = asRecord(value)
  const explicacao = asString(data?.explicacao)
  const referencia = asString(data?.referencia)

  if (typeof data?.acertou !== 'boolean' || !explicacao || !referencia) {
    throw new Error('A API não retornou uma avaliação válida.')
  }

  return { acertou: data.acertou, explicacao, referencia }
}

export const createSelahGateway = ({
  baseUrl = import.meta.env.VITE_API_URL ?? '',
  fetchFn = fetch,
}: GatewayOptions = {}): SelahGateway => {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')

  const requestJson = async (path: string, init: RequestInit): Promise<unknown> => {
    let response: Response
    try {
      response = await fetchFn(`${normalizedBaseUrl}${path}`, init)
    } catch {
      throw new Error('Não foi possível acessar o conteúdo do Selah.')
    }

    if (!response.ok) {
      throw new Error('Não foi possível acessar o conteúdo do Selah.')
    }

    try {
      return await response.json()
    } catch {
      throw new Error('A API retornou uma resposta inválida.')
    }
  }

  const postJson = (path: string, body: unknown) =>
    requestJson(path, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })

  return {
    buscarVersiculo: async ({ passagemId }, idioma) => {
      const query = new URLSearchParams({ passagemId, idioma })
      return parseVersiculo(
        await requestJson(`/api/versiculo?${query.toString()}`, {
          method: 'GET',
          headers: { accept: 'application/json' },
        }),
      )
    },
    gerarQuiz: async (input) => parseQuiz(await postJson('/api/quiz/gerar', input)),
    responderQuiz: async (input) =>
      parseAvaliacao(await postJson('/api/quiz/responder', input)),
    enviarMetricas: async (eventos, consentimento) => {
      if (!consentimento || eventos.length === 0) return

      let response: Response
      try {
        response = await fetchFn(`${normalizedBaseUrl}/api/metricas/eventos`, {
          method: 'POST',
          headers: { accept: 'application/json', 'content-type': 'application/json' },
          body: JSON.stringify({ eventos }),
        })
      } catch {
        return
      }

      if (!response.ok) return
    },
  }
}

export const selahGateway = createSelahGateway()
