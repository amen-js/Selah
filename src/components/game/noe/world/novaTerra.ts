import type { Ponto3D } from '../../../../mapas/types'
import { distancia3D, type PosicaoJogador } from '../../creation/proximidade'
import type {
  AcaoNoeId,
  EstadoProgressaoNoe,
} from '../progression/types'
import type { EstadoCandidatoTarefaNoe } from './types'

export type AcaoNovaTerraNoeId = Extract<
  AcaoNoeId,
  | 'noe.desembarque.aves'
  | 'noe.desembarque.herbivoros'
  | 'noe.desembarque.mamiferos'
  | 'noe.altar.construido'
  | 'noe.arco-iris.contemplado'
>

export type TipoVisualNovaTerraNoe =
  | 'aves'
  | 'herbivoros'
  | 'mamiferos'
  | 'altar'
  | 'arco-iris'

export interface DescritorTarefaNovaTerraNoe {
  id: string
  acaoId: AcaoNovaTerraNoeId
  unidadeId:
    | 'aves-desembarcadas-em-grupo'
    | 'herbivoros-desembarcados-em-grupo'
    | 'mamiferos-desembarcados-em-grupo'
    | 'altar-de-gratidao'
    | 'contemplacao-da-alianca'
  posicao: Ponto3D
  posicaoDestino: Ponto3D
  raio: number
  prioridade: number
  etapa: 1 | 2 | 3
  ordem: number
  tipoVisual: TipoVisualNovaTerraNoe
}

export interface EstadoTarefaNovaTerraNoe
  extends DescritorTarefaNovaTerraNoe {
  estado: EstadoCandidatoTarefaNoe
}

export interface CandidatoNovaTerraNoePuro
  extends DescritorTarefaNovaTerraNoe {
  tipo: 'tarefa'
  distancia: number
}

export interface EstadoVisualNovaTerraNoe {
  visivel: boolean
  gruposDesembarcados: readonly TipoVisualNovaTerraNoe[]
  altarConstruido: boolean
  arcoIrisVisivel: boolean
}

const PRIORIDADE_NOVA_TERRA = 390

export const MEIA_EXTENSAO_COLISOR_ALTAR_NOE: Ponto3D = [1.05, 0.65, 0.85]

export interface PenhascoArarateNoe {
  id: string
  posicao: Ponto3D
  escala: Ponto3D
  rotacaoY: number
  cor: string
}

/** Side cliffs frame the Ark without intersecting its navigable hull. */
export const penhascosArarateNoe: readonly PenhascoArarateNoe[] = [
  {
    id: 'ararate-oeste-fundo',
    posicao: [-23, 0.3, -25.5],
    escala: [9.5, 5.8, 9.5],
    rotacaoY: 0,
    cor: '#6f736b',
  },
  {
    id: 'ararate-leste-fundo',
    posicao: [23, 0.15, -25.5],
    escala: [9.2, 5.5, 9.2],
    rotacaoY: 0.58,
    cor: '#777b70',
  },
  {
    id: 'ararate-oeste-frente',
    posicao: [-20, -0.25, -13],
    escala: [7.2, 4.1, 7.2],
    rotacaoY: 1.16,
    cor: '#85877a',
  },
  {
    id: 'ararate-leste-frente',
    posicao: [20, -0.3, -13],
    escala: [7.4, 4.2, 7.4],
    rotacaoY: 1.74,
    cor: '#7c8075',
  },
] as const

/** Stage 1 is deliberately free-order; stages 2 and 3 are strict gates. */
export const tarefasNovaTerraNoe: readonly DescritorTarefaNovaTerraNoe[] = [
  {
    id: 'nova-terra-desembarque-aves',
    acaoId: 'noe.desembarque.aves',
    unidadeId: 'aves-desembarcadas-em-grupo',
    posicao: [-4.8, 0.65, 6.8],
    posicaoDestino: [-8.4, 1.15, 23.5],
    raio: 2.2,
    prioridade: PRIORIDADE_NOVA_TERRA,
    etapa: 1,
    ordem: 1,
    tipoVisual: 'aves',
  },
  {
    id: 'nova-terra-desembarque-herbivoros',
    acaoId: 'noe.desembarque.herbivoros',
    unidadeId: 'herbivoros-desembarcados-em-grupo',
    posicao: [0, 0.55, 8.8],
    posicaoDestino: [0, 0.65, 26],
    raio: 2.35,
    prioridade: PRIORIDADE_NOVA_TERRA,
    etapa: 1,
    ordem: 2,
    tipoVisual: 'herbivoros',
  },
  {
    id: 'nova-terra-desembarque-mamiferos',
    acaoId: 'noe.desembarque.mamiferos',
    unidadeId: 'mamiferos-desembarcados-em-grupo',
    posicao: [4.8, 0.48, 6.8],
    posicaoDestino: [8.4, 0.42, 23.5],
    raio: 2.15,
    prioridade: PRIORIDADE_NOVA_TERRA,
    etapa: 1,
    ordem: 3,
    tipoVisual: 'mamiferos',
  },
  {
    id: 'nova-terra-altar-gratidao',
    acaoId: 'noe.altar.construido',
    unidadeId: 'altar-de-gratidao',
    posicao: [0, 0.45, 27.2],
    posicaoDestino: [0, 0.45, 30.5],
    raio: 1.6,
    prioridade: PRIORIDADE_NOVA_TERRA,
    etapa: 2,
    ordem: 4,
    tipoVisual: 'altar',
  },
  {
    id: 'nova-terra-contemplacao-alianca',
    acaoId: 'noe.arco-iris.contemplado',
    unidadeId: 'contemplacao-da-alianca',
    posicao: [0, 0.45, 35.2],
    posicaoDestino: [0, 8.5, 43],
    raio: 2.7,
    prioridade: PRIORIDADE_NOVA_TERRA,
    etapa: 3,
    ordem: 5,
    tipoVisual: 'arco-iris',
  },
] as const

function momentoFinalConcluido(estado: EstadoProgressaoNoe): boolean {
  return (
    estado.concluida ||
    estado.momentosConcluidos.includes('nova-terra-arco-iris')
  )
}

function unidadeConcluida(
  estado: EstadoProgressaoNoe,
  tarefa: DescritorTarefaNovaTerraNoe,
): boolean {
  if (momentoFinalConcluido(estado)) return true
  if (estado.momentoAtualId !== 'nova-terra-arco-iris') return false

  return (
    estado.progressoMomentoAtual
      .find(({ acaoId }) => acaoId === tarefa.acaoId)
      ?.unidadesConcluidas.includes(tarefa.unidadeId) ?? false
  )
}

export function descreverTarefasNovaTerraNoe(
  estado: EstadoProgressaoNoe,
): readonly EstadoTarefaNovaTerraNoe[] {
  const noMomento =
    estado.momentoAtualId === 'nova-terra-arco-iris' && !estado.concluida

  return tarefasNovaTerraNoe.map((tarefa) => {
    const concluida = unidadeConcluida(estado, tarefa)
    const etapasAnterioresConcluidas = tarefasNovaTerraNoe
      .filter((requisito) => requisito.etapa < tarefa.etapa)
      .every((requisito) => unidadeConcluida(estado, requisito))
    const estadoTarefa: EstadoCandidatoTarefaNoe = concluida
      ? 'concluida'
      : !noMomento
        ? 'fora-do-momento'
        : etapasAnterioresConcluidas
          ? 'disponivel'
          : 'bloqueada'

    return { ...tarefa, estado: estadoTarefa }
  })
}

/** Resolves one nearby M9 task; the three animal groups can be chosen freely. */
export function resolverCandidatoNovaTerraNoe(
  posicaoJogador: PosicaoJogador,
  estado: EstadoProgressaoNoe,
): CandidatoNovaTerraNoePuro | null {
  const candidatos = descreverTarefasNovaTerraNoe(estado).flatMap((tarefa) => {
    if (tarefa.estado !== 'disponivel') return []
    const distancia = distancia3D(posicaoJogador, {
      x: tarefa.posicao[0],
      y: tarefa.posicao[1],
      z: tarefa.posicao[2],
    })
    if (distancia > tarefa.raio) return []
    return [{ ...tarefa, tipo: 'tarefa' as const, distancia }]
  })

  return (
    candidatos.sort(
      (a, b) =>
        a.distancia - b.distancia ||
        a.ordem - b.ordem ||
        a.id.localeCompare(b.id),
    )[0] ?? null
  )
}

/** The full rainbow is a durable reward, never scenery leaked before its gate. */
export function arcoIrisVisivelNoe(estado: EstadoProgressaoNoe): boolean {
  return unidadeConcluida(estado, tarefasNovaTerraNoe[4])
}

export function obterEstadoVisualNovaTerraNoe(
  estado: EstadoProgressaoNoe,
): EstadoVisualNovaTerraNoe {
  const visivel =
    estado.momentoAtualId === 'nova-terra-arco-iris' ||
    momentoFinalConcluido(estado)
  const tarefas = descreverTarefasNovaTerraNoe(estado)
  const concluiu = (tipoVisual: TipoVisualNovaTerraNoe) =>
    tarefas.some(
      (tarefa) =>
        tarefa.tipoVisual === tipoVisual && tarefa.estado === 'concluida',
    )

  return {
    visivel,
    gruposDesembarcados: tarefas
      .filter(
        ({ tipoVisual, estado: estadoTarefa }) =>
          estadoTarefa === 'concluida' &&
          ['aves', 'herbivoros', 'mamiferos'].includes(tipoVisual),
      )
      .map(({ tipoVisual }) => tipoVisual),
    altarConstruido: concluiu('altar'),
    arcoIrisVisivel: arcoIrisVisivelNoe(estado),
  }
}
