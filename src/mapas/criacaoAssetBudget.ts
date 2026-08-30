import type {
  AssetCriacaoId,
  EntradaManifestoAssetCriacao,
  ManifestoAssetsCriacao,
  MomentoCriacaoId,
  TipoAssetCriacao,
} from '../components/game/creation/progression'
import { momentosCriacao } from '../components/game/creation/progression'

/**
 * Web budgets for the current Creation slice.
 *
 * The single-file and per-moment limits leave room below a typical mobile
 * browser's first-request comfort zone, while the library limit is just above
 * the 2.49 MB measured unique payload in the integration report. These are
 * intentionally explicit so a future asset addition fails the focused audit
 * before it silently becomes an eager download.
 */
export const LIMITES_ORCAMENTO_ASSETS_CRIACAO = {
  arquivoWebMaxBytes: 1_500_000,
  momentoWebMaxBytes: 1_500_000,
  bibliotecaWebMaxBytes: 3_000_000,
} as const

export type FormatoAssetCriacao =
  | 'glb'
  | 'model-json-procedural'
  | 'outro'

export interface MedicaoAssetCriacao {
  id: AssetCriacaoId
  arquivo: string
  tipo: TipoAssetCriacao
  momentos: readonly MomentoCriacaoId[]
  carregamento: EntradaManifestoAssetCriacao['carregamento']
  formato: FormatoAssetCriacao
  /** Bytes of the file fetched by a URL-based loader. */
  bytesWeb: number
  /** Model payload bytes; procedural descriptors intentionally contribute 0. */
  bytesPayload: number
}

export interface ResumoAssetCriacao {
  entradas: number
  arquivosUnicos: number
  bytesWeb: number
  bytesPayload: number
  porFormato: Record<FormatoAssetCriacao, number>
}

export interface DuplicacaoAssetCriacao {
  arquivo: string
  ids: readonly AssetCriacaoId[]
  compartilhado: boolean
}

export interface AuditoriaAssetCriacao {
  registros: readonly MedicaoAssetCriacao[]
  porMomento: Readonly<Record<MomentoCriacaoId, ResumoAssetCriacao>>
  porTipo: Readonly<Record<TipoAssetCriacao, ResumoAssetCriacao>>
  bytesBibliotecaWeb: number
  bytesBibliotecaPayload: number
  arquivosBiblioteca: number
  idsDuplicados: readonly AssetCriacaoId[]
  duplicacoes: readonly DuplicacaoAssetCriacao[]
  duplicacoesAcidentais: readonly DuplicacaoAssetCriacao[]
}

const tiposAssetCriacao: readonly TipoAssetCriacao[] = [
  'ambiente',
  'marco',
  'prop',
  'personagem',
  'vfx',
  'audio',
]

const formatosAssetCriacao: readonly FormatoAssetCriacao[] = [
  'glb',
  'model-json-procedural',
  'outro',
]

function novoResumo(): ResumoAssetCriacao {
  return {
    entradas: 0,
    arquivosUnicos: 0,
    bytesWeb: 0,
    bytesPayload: 0,
    porFormato: Object.fromEntries(
      formatosAssetCriacao.map((formato) => [formato, 0]),
    ) as Record<FormatoAssetCriacao, number>,
  }
}

function novoResumoPorChave<T extends string>(
  chaves: readonly T[],
): Record<T, ResumoAssetCriacao> {
  return Object.fromEntries(chaves.map((chave) => [chave, novoResumo()])) as Record<
    T,
    ResumoAssetCriacao
  >
}

function novoConjuntoPorChave<T extends string>(
  chaves: readonly T[],
): Record<T, Set<string>> {
  return Object.fromEntries(chaves.map((chave) => [chave, new Set<string>()])) as Record<
    T,
    Set<string>
  >
}

/** Classifies procedural character descriptors without treating them as GLBs. */
export function classificarFormatoAssetCriacao(
  arquivo: string,
): FormatoAssetCriacao {
  const nome = arquivo.toLowerCase()
  if (nome.endsWith('.model.json')) return 'model-json-procedural'
  if (nome.endsWith('.glb')) return 'glb'
  return 'outro'
}

function tamanhoAsset(
  tamanhosPorArquivo: Readonly<Record<string, number>>,
  arquivo: string,
): number {
  if (!Object.prototype.hasOwnProperty.call(tamanhosPorArquivo, arquivo)) {
    throw new Error(`Tamanho ausente para asset da Criação: ${arquivo}`)
  }

  const tamanho = tamanhosPorArquivo[arquivo]
  if (!Number.isInteger(tamanho) || tamanho < 0) {
    throw new Error(`Tamanho inválido para asset da Criação: ${arquivo}`)
  }
  return tamanho
}

function adicionarResumo(
  resumo: ResumoAssetCriacao,
  registro: MedicaoAssetCriacao,
  arquivosContabilizados: Set<string>,
) {
  resumo.entradas += 1
  if (arquivosContabilizados.has(registro.arquivo)) return

  arquivosContabilizados.add(registro.arquivo)
  resumo.arquivosUnicos += 1
  resumo.bytesWeb += registro.bytesWeb
  resumo.bytesPayload += registro.bytesPayload
  resumo.porFormato[registro.formato] += registro.bytesWeb
}

/**
 * Calculates physical, per-moment and per-type budgets without reading files.
 * The caller supplies deterministic sizes so this function remains usable in
 * browser code and in a Node integrity test without bundling `node:fs`.
 */
export function auditarManifestoAssetsCriacao(
  manifesto: ManifestoAssetsCriacao,
  tamanhosPorArquivo: Readonly<Record<string, number>>,
): AuditoriaAssetCriacao {
  const registros = manifesto.entradas.map((entrada) => {
    const formato = classificarFormatoAssetCriacao(entrada.arquivo)
    const bytesWeb = tamanhoAsset(tamanhosPorArquivo, entrada.arquivo)
    return {
      id: entrada.id,
      arquivo: entrada.arquivo,
      tipo: entrada.tipo,
      momentos: entrada.momentos,
      carregamento: entrada.carregamento,
      formato,
      bytesWeb,
      // `.model.json` is a small procedural recipe; its referenced character
      // implementation is code, not an additional model download.
      bytesPayload: formato === 'model-json-procedural' ? 0 : bytesWeb,
    }
  })

  const porMomento = novoResumoPorChave(
    momentosCriacao.map(({ id }) => id),
  ) as Record<MomentoCriacaoId, ResumoAssetCriacao>
  const arquivosPorMomento = novoConjuntoPorChave(
    momentosCriacao.map(({ id }) => id),
  )
  const porTipo = novoResumoPorChave(tiposAssetCriacao)
  const arquivosPorTipo = novoConjuntoPorChave(tiposAssetCriacao)
  const arquivosBiblioteca = new Set<string>()
  const ids = new Map<AssetCriacaoId, number>()
  const entradasPorArquivo = new Map<string, MedicaoAssetCriacao[]>()

  for (const registro of registros) {
    ids.set(registro.id, (ids.get(registro.id) ?? 0) + 1)
    adicionarResumo(
      porTipo[registro.tipo],
      registro,
      arquivosPorTipo[registro.tipo],
    )
    arquivosBiblioteca.add(registro.arquivo)

    const entradas = entradasPorArquivo.get(registro.arquivo) ?? []
    entradas.push(registro)
    entradasPorArquivo.set(registro.arquivo, entradas)

    for (const momentoId of registro.momentos) {
      const resumo = porMomento[momentoId]
      if (!resumo) {
        throw new Error(
          `Momento inválido no manifesto de assets da Criação: ${momentoId}`,
        )
      }
      adicionarResumo(resumo, registro, arquivosPorMomento[momentoId])
    }
  }

  const duplicacoes = [...entradasPorArquivo.entries()]
    .filter(([, entradas]) => entradas.length > 1)
    .map(([arquivo, entradas]) => ({
      arquivo,
      ids: entradas.map(({ id }) => id),
      compartilhado: entradas.every(
        ({ carregamento }) => carregamento === 'compartilhado',
      ),
    }))

  return {
    registros,
    porMomento,
    porTipo,
    bytesBibliotecaWeb: [...arquivosBiblioteca].reduce(
      (total, arquivo) => total + tamanhoAsset(tamanhosPorArquivo, arquivo),
      0,
    ),
    bytesBibliotecaPayload: registros
      .filter(({ arquivo }, indice, todos) =>
        todos.findIndex((outro) => outro.arquivo === arquivo) === indice,
      )
      .reduce((total, registro) => total + registro.bytesPayload, 0),
    arquivosBiblioteca: arquivosBiblioteca.size,
    idsDuplicados: [...ids.entries()]
      .filter(([, quantidade]) => quantidade > 1)
      .map(([id]) => id),
    duplicacoes,
    duplicacoesAcidentais: duplicacoes.filter(
      ({ compartilhado }) => !compartilhado,
    ),
  }
}
