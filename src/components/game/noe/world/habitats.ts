import type { Ponto3D } from '../../../../mapas/types'
import { distancia3D, type PosicaoJogador } from '../../creation/proximidade'
import { indiceMomentoNoe } from '../progression/estado'
import type {
  AcaoNoeId,
  MomentoNoeId,
  ProgressoAcaoNoe,
} from '../progression/types'
import type { EspecieVisualNoe } from './animais'

export type AcaoHabitatNoeId = Extract<
  AcaoNoeId,
  | 'noe.habitat.grandes-animais-preparado'
  | 'noe.habitat.pequenos-mamiferos-preparado'
  | 'noe.habitat.aves-preparado'
  | 'noe.habitat.familia-noe-preparado'
>

export type NivelHabitatNoe = 'inferior' | 'medio' | 'superior'
export type EtapaInteracaoHabitatNoe =
  | 'selecionar-familia'
  | 'encaixar-habitat'
  | 'devolver-familia'

export type FamiliaHabitatNoeId =
  | 'elefantes'
  | 'girafas'
  | 'leoes'
  | 'ovelhas'
  | 'zebras'
  | 'coelhos'
  | 'aves'
  | 'familia-noe'

export interface DescritorHabitatNoe {
  id: FamiliaHabitatNoeId
  acaoId: AcaoHabitatNoeId
  unidadeId:
    | 'nivel-inferior-elefantes'
    | 'nivel-inferior-girafas'
    | 'nivel-inferior-leoes'
    | 'nivel-inferior-ovelhas'
    | 'nivel-inferior-zebras'
    | 'nivel-medio-coelhos'
    | 'nivel-superior-aves'
    | 'nivel-superior-familia-noe'
  nivel: NivelHabitatNoe
  especie: EspecieVisualNoe | 'familia-noe'
  quantidade: number
  posicaoEspera: Ponto3D
  posicaoHabitat: Ponto3D
  raio: number
  prioridade: number
  ordem: number
  cor: string
}

export interface EstadoHabitatNoe {
  descritor: DescritorHabitatNoe
  concluido: boolean
  selecionado: boolean
  mostrarNaEspera: boolean
  mostrarDescansando: boolean
}

export interface CandidatoHabitatNoePuro {
  tipo: 'tarefa'
  id: string
  acaoId: AcaoHabitatNoeId
  unidadeId: string
  familiaId: FamiliaHabitatNoeId
  etapaInteracao: EtapaInteracaoHabitatNoe
  posicao: Ponto3D
  raio: number
  prioridade: number
  distancia: number
}

const PRIORIDADE_HABITAT = 350

/**
 * Waiting spots form a readable line near the entrance. Destinations use the
 * exact lower/middle/upper deck roles defined by the GDD.
 */
export const habitatsArcaNoe: readonly DescritorHabitatNoe[] = [
  {
    id: 'elefantes',
    acaoId: 'noe.habitat.grandes-animais-preparado',
    unidadeId: 'nivel-inferior-elefantes',
    nivel: 'inferior',
    especie: 'elefante',
    quantidade: 2,
    posicaoEspera: [-5.1, 0.58, -7.1],
    posicaoHabitat: [-3.85, 0.72, -21.2],
    raio: 1.8,
    prioridade: PRIORIDADE_HABITAT,
    ordem: 1,
    cor: '#83a9b7',
  },
  {
    id: 'girafas',
    acaoId: 'noe.habitat.grandes-animais-preparado',
    unidadeId: 'nivel-inferior-girafas',
    nivel: 'inferior',
    especie: 'girafa',
    quantidade: 2,
    posicaoEspera: [-3.6, 0.58, -5.7],
    posicaoHabitat: [0, 0.78, -25.4],
    raio: 1.8,
    prioridade: PRIORIDADE_HABITAT,
    ordem: 2,
    cor: '#e7b85d',
  },
  {
    id: 'leoes',
    acaoId: 'noe.habitat.grandes-animais-preparado',
    unidadeId: 'nivel-inferior-leoes',
    nivel: 'inferior',
    especie: 'leao',
    quantidade: 3,
    posicaoEspera: [-1.7, 0.48, -6.9],
    posicaoHabitat: [3.85, 0.65, -21.2],
    raio: 1.8,
    prioridade: PRIORIDADE_HABITAT,
    ordem: 3,
    cor: '#d89045',
  },
  {
    id: 'ovelhas',
    acaoId: 'noe.habitat.grandes-animais-preparado',
    unidadeId: 'nivel-inferior-ovelhas',
    nivel: 'inferior',
    especie: 'ovelha',
    quantidade: 3,
    posicaoEspera: [1.7, 0.42, -6.9],
    posicaoHabitat: [-3.85, 0.58, -29.1],
    raio: 1.8,
    prioridade: PRIORIDADE_HABITAT,
    ordem: 4,
    cor: '#eee2c3',
  },
  {
    id: 'zebras',
    acaoId: 'noe.habitat.grandes-animais-preparado',
    unidadeId: 'nivel-inferior-zebras',
    nivel: 'inferior',
    especie: 'zebra',
    quantidade: 3,
    posicaoEspera: [3.6, 0.48, -5.7],
    posicaoHabitat: [3.85, 0.62, -29.1],
    raio: 1.8,
    prioridade: PRIORIDADE_HABITAT,
    ordem: 5,
    cor: '#d7d9d7',
  },
  {
    id: 'coelhos',
    acaoId: 'noe.habitat.pequenos-mamiferos-preparado',
    unidadeId: 'nivel-medio-coelhos',
    nivel: 'medio',
    especie: 'coelho',
    quantidade: 4,
    posicaoEspera: [5.1, 0.4, -7.1],
    posicaoHabitat: [-3.75, 2.62, -23.2],
    raio: 1.7,
    prioridade: PRIORIDADE_HABITAT,
    ordem: 6,
    cor: '#dca3ce',
  },
  {
    id: 'aves',
    acaoId: 'noe.habitat.aves-preparado',
    unidadeId: 'nivel-superior-aves',
    nivel: 'superior',
    especie: 'ave',
    quantidade: 4,
    posicaoEspera: [-2.5, 0.75, -9.2],
    posicaoHabitat: [-3.55, 4.72, -24.4],
    raio: 1.7,
    prioridade: PRIORIDADE_HABITAT,
    ordem: 7,
    cor: '#f2ca6a',
  },
  {
    id: 'familia-noe',
    acaoId: 'noe.habitat.familia-noe-preparado',
    unidadeId: 'nivel-superior-familia-noe',
    nivel: 'superior',
    especie: 'familia-noe',
    quantidade: 3,
    posicaoEspera: [2.5, 0.62, -9.2],
    posicaoHabitat: [3.55, 4.62, -24.4],
    raio: 1.7,
    prioridade: PRIORIDADE_HABITAT,
    ordem: 8,
    cor: '#74c6b5',
  },
] as const

function progressoContemUnidade(
  progressoMomentoAtual: readonly ProgressoAcaoNoe[],
  acaoId: AcaoHabitatNoeId,
  unidadeId: string,
): boolean {
  return (
    progressoMomentoAtual
      .find((progresso) => progresso.acaoId === acaoId)
      ?.unidadesConcluidas.some((unidade) => unidade.trim() === unidadeId) ??
    false
  )
}

/** Resting families persist after M5 even though the active checkpoint resets. */
export function habitatConcluidoNoe(
  descritor: DescritorHabitatNoe,
  momentoAtualId: MomentoNoeId,
  progressoMomentoAtual: readonly ProgressoAcaoNoe[],
): boolean {
  const indiceAtual = indiceMomentoNoe(momentoAtualId)
  const indiceAcomodacao = indiceMomentoNoe('acomodacao-animais')
  if (indiceAtual > indiceAcomodacao) return true
  if (indiceAtual < indiceAcomodacao) return false

  return progressoContemUnidade(
    progressoMomentoAtual,
    descritor.acaoId,
    descritor.unidadeId,
  )
}

export function habitatsArcaNoeVisiveis(
  momentoAtualId: MomentoNoeId,
): boolean {
  return (
    indiceMomentoNoe(momentoAtualId) >=
    indiceMomentoNoe('acomodacao-animais')
  )
}

export function descreverEstadoHabitatsArcaNoe(
  momentoAtualId: MomentoNoeId,
  progressoMomentoAtual: readonly ProgressoAcaoNoe[],
  familiaSelecionadaId: FamiliaHabitatNoeId | null,
): readonly EstadoHabitatNoe[] {
  const momentoAtivo = momentoAtualId === 'acomodacao-animais'

  return habitatsArcaNoe.map((descritor) => {
    const concluido = habitatConcluidoNoe(
      descritor,
      momentoAtualId,
      progressoMomentoAtual,
    )
    const selecionado =
      momentoAtivo && !concluido && familiaSelecionadaId === descritor.id

    return {
      descritor,
      concluido,
      selecionado,
      mostrarNaEspera: momentoAtivo && !concluido && !selecionado,
      mostrarDescansando: concluido,
    }
  })
}

function candidatoParaPosicao(
  jogador: PosicaoJogador,
  descritor: DescritorHabitatNoe,
  etapaInteracao: EtapaInteracaoHabitatNoe,
  posicao: Ponto3D,
): (CandidatoHabitatNoePuro & { ordem: number }) | null {
  const distancia = distancia3D(jogador, {
    x: posicao[0],
    y: posicao[1],
    z: posicao[2],
  })
  if (distancia > descritor.raio) return null

  return {
    tipo: 'tarefa',
    id: `habitat:${etapaInteracao}:${descritor.id}`,
    acaoId: descritor.acaoId,
    unidadeId: descritor.unidadeId,
    familiaId: descritor.id,
    etapaInteracao,
    posicao,
    raio: descritor.raio,
    prioridade: descritor.prioridade,
    distancia,
    ordem: descritor.ordem,
  }
}

/**
 * Empty hands expose every unfinished family. Carrying one family exposes
 * only its matching habitat (plus its origin, so a child can put it back).
 */
export function resolverCandidatoHabitatArcaNoe(
  posicaoJogador: PosicaoJogador,
  momentoAtualId: MomentoNoeId,
  progressoMomentoAtual: readonly ProgressoAcaoNoe[],
  familiaSelecionadaId: FamiliaHabitatNoeId | null,
): CandidatoHabitatNoePuro | null {
  if (momentoAtualId !== 'acomodacao-animais') return null

  const estados = descreverEstadoHabitatsArcaNoe(
    momentoAtualId,
    progressoMomentoAtual,
    familiaSelecionadaId,
  )
  const candidatos: Array<CandidatoHabitatNoePuro & { ordem: number }> = []

  if (familiaSelecionadaId) {
    const estado = estados.find(
      ({ descritor }) => descritor.id === familiaSelecionadaId,
    )
    if (!estado || estado.concluido) return null

    const encaixe = candidatoParaPosicao(
      posicaoJogador,
      estado.descritor,
      'encaixar-habitat',
      estado.descritor.posicaoHabitat,
    )
    if (encaixe) candidatos.push(encaixe)

    const devolucao = candidatoParaPosicao(
      posicaoJogador,
      estado.descritor,
      'devolver-familia',
      estado.descritor.posicaoEspera,
    )
    if (devolucao) candidatos.push(devolucao)
  } else {
    for (const estado of estados) {
      if (estado.concluido) continue
      const selecao = candidatoParaPosicao(
        posicaoJogador,
        estado.descritor,
        'selecionar-familia',
        estado.descritor.posicaoEspera,
      )
      if (selecao) candidatos.push(selecao)
    }
  }

  const selecionado = candidatos.sort(
    (a, b) =>
      a.distancia - b.distancia ||
      a.ordem - b.ordem ||
      a.id.localeCompare(b.id),
  )[0]
  if (!selecionado) return null

  return selecionado
}
