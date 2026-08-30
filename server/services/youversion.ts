import type { Idioma } from '../data/passagens.ts'
import versiculosCache from '../data/versiculos-cache.json' with { type: 'json' }

export interface VersiculoCacheado {
  referencia: string
  texto: string
  versao: string
  atribuicao: string
}

export interface VersiculoResolvido extends VersiculoCacheado {
  passagemId: string
  idioma: Idioma
  origem: 'youversion' | 'cache'
}

type VersiculosCache = Record<string, Partial<Record<Idioma, VersiculoCacheado>>>

const cache = versiculosCache as VersiculosCache

export interface YouVersionConfig {
  appKey: string
  bibleIds: Record<Idioma, number>
  fetchFn?: typeof fetch
}

interface YouVersionPassage {
  content?: string
  reference?: string
  copyright?: string
  id?: string
}

const METADADOS_BIBLIA: Record<number, { versao: string; atribuicao: string }> = {
  3254: {
    versao: 'Bíblia Livre Para Todos',
    atribuicao:
      'Dr. Jonathan Gallagher. Creative Commons Atribuição-CompartilhaIgual 4.0. Texto obtido via YouVersion Platform.',
  },
  3034: {
    versao: 'Berean Standard Bible',
    atribuicao: 'Berean Standard Bible. Public Domain. Texto obtido via YouVersion Platform.',
  },
  3291: {
    versao: 'Versión Biblia Libre',
    atribuicao: 'Versión Biblia Libre. Texto obtido via YouVersion Platform.',
  },
  147: {
    versao: 'Reina-Valera Antigua',
    atribuicao: 'Reina-Valera Antigua. Texto obtido via YouVersion Platform.',
  },
}

const metadadosBiblia = (bibleId: number, copyright?: string) => {
  const conhecido = METADADOS_BIBLIA[bibleId]
  return {
    versao: conhecido?.versao ?? `YouVersion ${bibleId}`,
    atribuicao:
      copyright?.trim() ||
      conhecido?.atribuicao ||
      'Texto obtido via YouVersion Platform. Exibido sob a licença da versão. Sem cache em disco.',
  }
}

const chaveSessao = (passagemId: string, idioma: Idioma, bibleId: number): string =>
  `${bibleId}:${passagemId}:${idioma}`

export const buscarVersiculoCache = (
  passagemId: string,
  idioma: Idioma,
): VersiculoResolvido | undefined => {
  const local = cache[passagemId]?.[idioma]
  if (!local) return undefined
  return { ...local, passagemId, idioma, origem: 'cache' }
}

const limparTexto = (content: string): string =>
  content.replace(/\s+/g, ' ').replace(/^\d+\s*/, '').trim()

export const createYouVersionClient = ({
  appKey,
  bibleIds,
  fetchFn = fetch,
}: YouVersionConfig) => {
  const sessao = new Map<string, VersiculoResolvido>()

  const buscarRemoto = async (
    usfm: string,
    passagemId: string,
    idioma: Idioma,
  ): Promise<VersiculoResolvido | undefined> => {
    if (!appKey) return undefined

    const bibleId = bibleIds[idioma]
    const memoKey = chaveSessao(passagemId, idioma, bibleId)
    const memo = sessao.get(memoKey)
    if (memo) return memo

    const url = `https://api.youversion.com/v1/bibles/${bibleId}/passages/${encodeURIComponent(usfm)}?format=text`
    const response = await fetchFn(url, {
      headers: {
        Accept: 'application/json',
        'X-YVP-App-Key': appKey,
      },
    })
    if (!response.ok) return undefined

    const payload = (await response.json()) as YouVersionPassage
    const texto = typeof payload.content === 'string' ? limparTexto(payload.content) : ''
    if (!texto) return undefined

    const meta = metadadosBiblia(bibleId, payload.copyright)
    const resolvido: VersiculoResolvido = {
      passagemId,
      idioma,
      texto,
      referencia: payload.reference?.trim() || usfm,
      versao: meta.versao,
      atribuicao: meta.atribuicao,
      origem: 'youversion',
    }
    sessao.set(memoKey, resolvido)
    return resolvido
  }

  return {
    buscar: async (
      usfm: string,
      passagemId: string,
      idioma: Idioma,
    ): Promise<VersiculoResolvido | undefined> => {
      try {
        const remoto = await buscarRemoto(usfm, passagemId, idioma)
        if (remoto) return remoto
      } catch {
        // Cai no snapshot público autorizado.
      }
      return buscarVersiculoCache(passagemId, idioma)
    },
  }
}

export type YouVersionClient = ReturnType<typeof createYouVersionClient>
