import {
  obterRevelacaoCriacao,
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
  const revelacao = obterRevelacaoCriacao(momentoId)
  const reducedMotion = Boolean(opcoes?.reducedMotion)

  const efeitosAtivos = revelacao.assetsVisiveis.filter(ehEfeitoProcedural)
  const ativosSet = new Set(efeitosAtivos)

  const todasEntradas = IDS_EFEITOS_PROCEDURAIS.map((id) => ({
    id,
    ativo: ativosSet.has(id),
    reducedMotion,
  }))

  return {
    momentoId,
    faseCenario: revelacao.faseCenario,
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
      x: (rand() - 0.5) * 28,
      y: 0.3 + rand() * 5.2,
      z: (rand() - 0.5) * 28,
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
    [0, 0.03, 2.5],
    [-1.2, 0.03, 4.2],
    [-2.8, 0.03, 5.5],
    [-4.6, 0.03, 6.2],
    [-6.5, 0.03, 6.0],
    [-8.0, 0.03, 5.0],
    [-7.2, 0.03, 3.2],
    [-5.5, 0.03, 1.8],
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
    [-3, 0.05, 3],
    [-7, 0.05, 5],
    [-1, 0.05, -3],
    [4, 0.05, 2],
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
