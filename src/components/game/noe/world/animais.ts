import type { Ponto3D } from '../../../../mapas/types'
import { distancia3D, type PosicaoJogador } from '../../creation/proximidade'
import { indiceMomentoNoe } from '../progression/estado'
import type {
  AcaoNoeId,
  MomentoNoeId,
  ProgressoAcaoNoe,
} from '../progression/types'

export type AcaoConducaoAnimaisNoeId = Extract<
  AcaoNoeId,
  | 'noe.animais.aves-guiadas'
  | 'noe.animais.herbivoros-guiados'
  | 'noe.animais.mamiferos-guiados'
>

export type EspecieVisualNoe =
  | 'ave'
  | 'coelho'
  | 'elefante'
  | 'girafa'
  | 'leao'
  | 'ovelha'
  | 'zebra'

export type GrupoConducaoAnimaisNoeId =
  | 'aves'
  | 'grandes-herbivoros'
  | 'pequenos-mamiferos'

export type ComportamentoConducaoNoe =
  | 'trilha-sementes'
  | 'ponte-alinhada'
  | 'cestos'

export interface DescritorGrupoConducaoAnimaisNoe {
  id: GrupoConducaoAnimaisNoeId
  acaoId: AcaoConducaoAnimaisNoeId
  unidadeId:
    | 'aves-trilha-sementes'
    | 'grandes-herbivoros-ponte-alinhada'
    | 'pequenos-mamiferos-cestos'
  comportamento: ComportamentoConducaoNoe
  especies: readonly EspecieVisualNoe[]
  posicaoInicial: Ponto3D
  posicaoInteracao: Ponto3D
  posicaoDestino: Ponto3D
  caminho: readonly Ponto3D[]
  raio: number
  prioridade: number
  ordem: number
  cor: string
}

export interface EstadoGrupoConducaoAnimaisNoe {
  descritor: DescritorGrupoConducaoAnimaisNoe
  concluido: boolean
  disponivel: boolean
}

export interface CandidatoCampoAnimaisNoePuro {
  tipo: 'tarefa'
  id: string
  acaoId: AcaoConducaoAnimaisNoeId
  unidadeId: string
  posicao: Ponto3D
  raio: number
  prioridade: number
  distancia: number
  comportamento: ComportamentoConducaoNoe
}

const PRIORIDADE_CONDUCAO = 340

/**
 * Each entry represents a whole family/group. No task ever exposes an
 * individual animal as a progression unit.
 */
export const gruposConducaoAnimaisNoe: readonly DescritorGrupoConducaoAnimaisNoe[] = [
  {
    id: 'aves',
    acaoId: 'noe.animais.aves-guiadas',
    unidadeId: 'aves-trilha-sementes',
    comportamento: 'trilha-sementes',
    especies: ['ave', 'ave', 'ave', 'ave'],
    posicaoInicial: [-18, 1.5, 18],
    posicaoInteracao: [-14, 0.25, 14],
    posicaoDestino: [-2.8, 1.4, 5.4],
    caminho: [
      [-18, 1.5, 18],
      [-14, 1.35, 14],
      [-10, 1.45, 11],
      [-6.5, 1.35, 8],
      [-2.8, 1.4, 5.4],
    ],
    raio: 2.25,
    prioridade: PRIORIDADE_CONDUCAO,
    ordem: 1,
    cor: '#f2c96d',
  },
  {
    id: 'grandes-herbivoros',
    acaoId: 'noe.animais.herbivoros-guiados',
    unidadeId: 'grandes-herbivoros-ponte-alinhada',
    comportamento: 'ponte-alinhada',
    especies: ['elefante', 'girafa', 'zebra'],
    posicaoInicial: [24, 0.72, 17],
    posicaoInteracao: [13.2, 0.55, 11.5],
    posicaoDestino: [3.2, 0.72, 5.2],
    caminho: [
      [24, 0.72, 17],
      [19, 0.72, 15],
      [14, 0.72, 12],
      [9, 0.72, 9],
      [3.2, 0.72, 5.2],
    ],
    raio: 2.45,
    prioridade: PRIORIDADE_CONDUCAO,
    ordem: 2,
    cor: '#84bf75',
  },
  {
    id: 'pequenos-mamiferos',
    acaoId: 'noe.animais.mamiferos-guiados',
    unidadeId: 'pequenos-mamiferos-cestos',
    comportamento: 'cestos',
    especies: ['coelho', 'coelho', 'coelho'],
    posicaoInicial: [15.5, 0.35, 26],
    posicaoInteracao: [11.5, 0.48, 21.5],
    posicaoDestino: [0.8, 0.42, 7.2],
    caminho: [
      [15.5, 0.35, 26],
      [12, 0.4, 22],
      [8.5, 0.4, 17],
      [5, 0.4, 12],
      [0.8, 0.42, 7.2],
    ],
    raio: 2.1,
    prioridade: PRIORIDADE_CONDUCAO,
    ordem: 3,
    cor: '#db9ec8',
  },
] as const

function progressoContemUnidade(
  progressoMomentoAtual: readonly ProgressoAcaoNoe[],
  acaoId: AcaoConducaoAnimaisNoeId,
  unidadeId: string,
): boolean {
  return (
    progressoMomentoAtual
      .find((progresso) => progresso.acaoId === acaoId)
      ?.unidadesConcluidas.some((unidade) => unidade.trim() === unidadeId) ??
    false
  )
}

/** Completed groups remain projected as complete after M4 changes moment. */
export function grupoConducaoAnimaisConcluidoNoe(
  descritor: DescritorGrupoConducaoAnimaisNoe,
  momentoAtualId: MomentoNoeId,
  progressoMomentoAtual: readonly ProgressoAcaoNoe[],
): boolean {
  const indiceAtual = indiceMomentoNoe(momentoAtualId)
  const indiceConducao = indiceMomentoNoe('conducao-animais')
  if (indiceAtual > indiceConducao) return true
  if (indiceAtual < indiceConducao) return false

  return progressoContemUnidade(
    progressoMomentoAtual,
    descritor.acaoId,
    descritor.unidadeId,
  )
}

export function descreverEstadoCampoAnimaisNoe(
  momentoAtualId: MomentoNoeId,
  progressoMomentoAtual: readonly ProgressoAcaoNoe[],
): readonly EstadoGrupoConducaoAnimaisNoe[] {
  const momentoAtivo = momentoAtualId === 'conducao-animais'

  return gruposConducaoAnimaisNoe.map((descritor) => {
    const concluido = grupoConducaoAnimaisConcluidoNoe(
      descritor,
      momentoAtualId,
      progressoMomentoAtual,
    )
    return {
      descritor,
      concluido,
      disponivel: momentoAtivo && !concluido,
    }
  })
}

export function campoAnimaisNoeVisivel(
  momentoAtualId: MomentoNoeId,
): boolean {
  const indiceAtual = indiceMomentoNoe(momentoAtualId)
  return (
    indiceAtual >= indiceMomentoNoe('conducao-animais') &&
    indiceAtual <= indiceMomentoNoe('acomodacao-animais')
  )
}

/** Samples a multi-segment authored route without mutating its points. */
export function interpolarCaminhoGrupoAnimaisNoe(
  caminho: readonly Ponto3D[],
  progresso: number,
): Ponto3D {
  if (caminho.length === 0) return [0, 0, 0]
  if (caminho.length === 1) return caminho[0]

  const progressoSeguro = Math.min(1, Math.max(0, progresso))
  const posicaoEscalar = progressoSeguro * (caminho.length - 1)
  const indiceInicial = Math.min(
    caminho.length - 2,
    Math.floor(posicaoEscalar),
  )
  const fracao = posicaoEscalar - indiceInicial
  const inicio = caminho[indiceInicial]
  const fim = caminho[indiceInicial + 1]

  return [
    inicio[0] + (fim[0] - inicio[0]) * fracao,
    inicio[1] + (fim[1] - inicio[1]) * fracao,
    inicio[2] + (fim[2] - inicio[2]) * fracao,
  ]
}

/** Resolves one whole-group behavior; it never listens for keyboard input. */
export function resolverCandidatoCampoAnimaisNoe(
  posicaoJogador: PosicaoJogador,
  momentoAtualId: MomentoNoeId,
  progressoMomentoAtual: readonly ProgressoAcaoNoe[],
): CandidatoCampoAnimaisNoePuro | null {
  if (momentoAtualId !== 'conducao-animais') return null

  const candidatos = descreverEstadoCampoAnimaisNoe(
    momentoAtualId,
    progressoMomentoAtual,
  ).flatMap(({ descritor, disponivel }) => {
    if (!disponivel) return []
    const distancia = distancia3D(posicaoJogador, {
      x: descritor.posicaoInteracao[0],
      y: descritor.posicaoInteracao[1],
      z: descritor.posicaoInteracao[2],
    })
    if (distancia > descritor.raio) return []

    return [
      {
        tipo: 'tarefa' as const,
        id: `campo-animais:${descritor.id}`,
        acaoId: descritor.acaoId,
        unidadeId: descritor.unidadeId,
        posicao: descritor.posicaoInteracao,
        raio: descritor.raio,
        prioridade: descritor.prioridade,
        distancia,
        comportamento: descritor.comportamento,
        ordem: descritor.ordem,
      },
    ]
  })

  const selecionado = candidatos.sort(
    (a, b) =>
      a.distancia - b.distancia ||
      a.ordem - b.ordem ||
      a.id.localeCompare(b.id),
  )[0]
  if (!selecionado) return null

  return selecionado
}
