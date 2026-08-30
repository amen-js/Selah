import {
  indiceMomentoCriacao,
  momentoCriacaoPorId,
  type MomentoCriacaoId,
  type AssetCriacaoId,
} from '../progression'
import type {
  ConfiguracaoEfeitosCriacao,
  OpcoesConfiguracaoEfeitos,
  PontoCrescimento,
  PontoEstrela,
  PontoNuvem,
  PontoParticula,
  ProceduralVfxAssetId,
} from './types'

export const IDS_EFEITOS_PROCEDURAIS: readonly ProceduralVfxAssetId[] = [
  'ambiente-vazio',
  'luz-guia',
  'nucleo-luz',
  'marcadores-caminho-luz',
  'efeito-crescimento',
  'sol',
  'lua',
  'estrelas',
  'nuvens',
] as const

const SET_IDS_PROCEDURAIS = new Set<string>(IDS_EFEITOS_PROCEDURAIS)

/**
 * Cues that belong to one narrative beat only. They are deliberately kept
 * separate from `RevelacaoCriacao.assetsVisiveis`, whose cumulative contract
 * is still useful to the physical scene chunks.
 */
const EFEITOS_DO_BEAT: ReadonlyMap<
  MomentoCriacaoId,
  readonly ProceduralVfxAssetId[]
> = new Map([
  ['vazio', ['ambiente-vazio', 'luz-guia']],
  ['luz', ['luz-guia', 'nucleo-luz', 'marcadores-caminho-luz']],
  ['ceu-terra-aguas', []],
  ['natureza', ['efeito-crescimento']],
])

const EFEITOS_CELESTES: readonly ProceduralVfxAssetId[] = [
  'sol',
  'lua',
  'estrelas',
  'nuvens',
]

const INDICE_INICIO_CELESTE = indiceMomentoCriacao('ceu-ritmo')

/**
 * Resolves procedural cues for the active beat.
 *
 * Narrative cues are ephemeral by design: empty ambience, the guide, the
 * light core/path markers, and growth particles are mounted only in their
 * own beat. Celestial cues are the exception and remain from `ceu-ritmo`
 * onwards, matching the persistent sky established by that beat.
 */
export function obterEfeitosProceduraisVisiveis(
  momentoId: MomentoCriacaoId,
): readonly ProceduralVfxAssetId[] {
  const indiceAtual = indiceMomentoCriacao(momentoId)
  const ids = new Set<ProceduralVfxAssetId>(EFEITOS_DO_BEAT.get(momentoId) ?? [])

  if (indiceAtual >= INDICE_INICIO_CELESTE) {
    for (const id of EFEITOS_CELESTES) ids.add(id)
  }

  return IDS_EFEITOS_PROCEDURAIS.filter((id) => ids.has(id))
}

/**
 * Returns true if an asset ID corresponds to a procedural visual effect.
 */
export function ehEfeitoProcedural(
  assetId: AssetCriacaoId | string,
): assetId is ProceduralVfxAssetId {
  return SET_IDS_PROCEDURAIS.has(assetId)
}

/**
 * Computes active procedural effects and configuration for a given Creation moment.
 */
export function obterConfiguracaoEfeitosCriacao(
  momentoId: MomentoCriacaoId,
  opcoes?: OpcoesConfiguracaoEfeitos,
): ConfiguracaoEfeitosCriacao {
  const reducedMotion = Boolean(opcoes?.reducedMotion)

  const efeitosAtivos = obterEfeitosProceduraisVisiveis(momentoId)
  const ativosSet = new Set(efeitosAtivos)

  const todasEntradas = IDS_EFEITOS_PROCEDURAIS.map((id) => ({
    id,
    ativo: ativosSet.has(id),
    reducedMotion,
  }))

  return {
    momentoId,
    faseCenario: momentoCriacaoPorId.get(momentoId)?.faseCenario ?? 'escuro',
    reducedMotion,
    efeitosAtivos,
    todasEntradas,
    temEfeito: (id: ProceduralVfxAssetId) => ativosSet.has(id),
  }
}

/**
 * Mulberry32 PRNG for deterministic coordinate generation.
 */
export function criarPrng(seed: number): () => number {
  let s = seed >>> 0
  return function proximoNumero(): number {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Generates deterministic points for empty ambient particles.
 */
export function gerarPontosAmbienteVazio(
  contagem: number = 48,
  seed: number = 1001,
): PontoParticula[] {
  const rand = criarPrng(seed)
  const pontos: PontoParticula[] = []

  for (let i = 0; i < contagem; i++) {
    pontos.push({
      x: (rand() - 0.5) * 46,
      y: 0.3 + rand() * 5.2,
      z: (rand() - 0.5) * 42,
      velocidade: 0.03 + rand() * 0.03,
      fase: rand() * Math.PI * 2,
      tamanho: 0.09 + rand() * 0.05,
    })
  }

  return pontos
}

/**
 * Generates deterministic positions for pathway light markers.
 */
export function gerarMarcadoresCaminhoLuz(): Array<[number, number, number]> {
  return [
    [0.8, 0.03, 18.6],
    [2.2, 0.03, 17.8],
    [3.8, 0.03, 16.9],
    [5.4, 0.03, 15.9],
    [6.9, 0.03, 15.0],
    [8.2, 0.03, 14.2],
    [9.2, 0.03, 13.6],
    [10.0, 0.03, 13.0],
  ]
}

/**
 * Generates deterministic growth particles around focal points.
 */
export function gerarParticulasCrescimento(
  contagem: number = 28,
  seed: number = 2002,
): PontoCrescimento[] {
  const rand = criarPrng(seed)
  const pontos: PontoCrescimento[] = []
  const origens: Array<[number, number, number]> = [
    [-13, 0.2, 9],
    [-10, 0.1, 11],
    [-15, 0.15, 6],
    [10, 0.05, 9],
  ]

  for (let i = 0; i < contagem; i++) {
    const origem = origens[i % origens.length]
    const angulo = rand() * Math.PI * 2
    const raio = 0.2 + rand() * 0.65
    pontos.push({
      origem,
      deslocamento: [Math.cos(angulo) * raio, rand() * 1.8, Math.sin(angulo) * raio],
      velocidade: 0.4 + rand() * 0.3,
      fase: rand() * Math.PI * 2,
      escala: 0.06 + rand() * 0.05,
      corIndex: Math.floor(rand() * 3),
    })
  }

  return pontos
}

/**
 * Generates deterministic celestial star dome coordinates.
 */
export function gerarPontosEstrelas(
  contagem: number = 140,
  raio: number = 42,
  seed: number = 3003,
): PontoEstrela[] {
  const rand = criarPrng(seed)
  const estrelas: PontoEstrela[] = []

  for (let i = 0; i < contagem; i++) {
    const u = rand()
    const v = rand()
    const theta = u * 2.0 * Math.PI
    const phi = Math.acos(0.15 + v * 0.82)

    const x = raio * Math.sin(phi) * Math.cos(theta)
    const y = raio * Math.cos(phi)
    const z = raio * Math.sin(phi) * Math.sin(theta)

    estrelas.push({
      x,
      y,
      z,
      tamanho: 0.11 + rand() * 0.05,
      fase: rand() * Math.PI * 2,
      frequencia: 0.15 + rand() * 0.15,
      brilhoBase: 0.65 + rand() * 0.35,
    })
  }

  return estrelas
}

/**
 * Generates deterministic low-poly cloud cluster initial definitions.
 */
export function gerarDefinicoesNuvens(): PontoNuvem[] {
  return [
    { posicao: [-22, 15, -18], escala: [5.2, 1.8, 3.5], velocidade: 0.22 },
    { posicao: [-6, 17, -24], escala: [6.8, 2.2, 4.2], velocidade: 0.28 },
    { posicao: [12, 14, -16], escala: [4.8, 1.6, 3.2], velocidade: 0.24 },
    { posicao: [24, 16, -22], escala: [5.8, 2.0, 3.8], velocidade: 0.26 },
    { posicao: [-14, 18, 16], escala: [6.2, 2.1, 4.0], velocidade: 0.25 },
    { posicao: [10, 16, 20], escala: [5.0, 1.7, 3.4], velocidade: 0.23 },
  ]
}
