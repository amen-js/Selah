import type { Ponto3D } from '../../../../mapas/types'
import { distancia3D, type PosicaoJogador } from '../../creation/proximidade'
import { indiceMomentoNoe, obterClimaNoe } from '../progression/estado'
import type {
  AcaoNoeId,
  EstadoProgressaoNoe,
  MomentoNoeId,
  PercentualPreparacaoNoe,
} from '../progression/types'
import type { EstadoCandidatoTarefaNoe } from './types'

export type AcaoAbrigoTempestadeNoeId = Extract<
  AcaoNoeId,
  | 'noe.abrigo.chamado-ouvido'
  | 'noe.abrigo.entrada-concluida'
  | 'noe.porta.fechada'
  | 'noe.cuidado.filhotes-aves'
  | 'noe.cuidado.filhotes-herbivoros'
  | 'noe.cuidado.filhotes-mamiferos'
>

export type MomentoAbrigoTempestadeNoeId = Extract<
  MomentoNoeId,
  'fechamento-porta' | 'refugio-tempestade'
>

export type TipoVisualTarefaAbrigoNoe =
  | 'chamado'
  | 'entrada'
  | 'porta'
  | 'filhotes-aves'
  | 'filhotes-herbivoros'
  | 'filhotes-mamiferos'

export interface DescritorTarefaAbrigoNoe {
  id: string
  momentoId: MomentoAbrigoTempestadeNoeId
  acaoId: AcaoAbrigoTempestadeNoeId
  unidadeId: string
  posicao: Ponto3D
  raio: number
  prioridade: number
  etapa: number
  ordem: number
  tipoVisual: TipoVisualTarefaAbrigoNoe
}

export interface EstadoTarefaAbrigoNoe extends DescritorTarefaAbrigoNoe {
  estado: EstadoCandidatoTarefaNoe
}

export interface CandidatoAbrigoTempestadeNoePuro
  extends DescritorTarefaAbrigoNoe {
  distancia: number
  estado: Extract<EstadoCandidatoTarefaNoe, 'disponivel'>
}

export interface EstadoVisualAbrigoNoe {
  chamadoOuvido: boolean
  entradaConcluida: boolean
  porta: 'aberta' | 'fechada'
  interiorAcolhedor: boolean
  cuidadosConcluidos: readonly TipoVisualTarefaAbrigoNoe[]
}

export interface ProjecaoAtmosferaNoe {
  percentualPreparacao: PercentualPreparacaoNoe
  densidadeNuvens: 0 | 0.22 | 0.33 | 0.66 | 1
  intensidadeVento: 0 | 0.12 | 0.25 | 0.55 | 0.72
  chuvaExteriorAtiva: boolean
  corCeu: string
  corNuvem: string
}

const PRIORIDADE_ABRIGO = 360

/**
 * World-space positions match the ark shell at [0, 0, -16]. The safe-entry
 * point is beyond the doorway (world z=-2), so the door is never allowed to
 * close while the child is still outside.
 */
export const tarefasAbrigoTempestadeNoe: readonly DescritorTarefaAbrigoNoe[] = [
  {
    id: 'abrigo-chamado-final-noe',
    momentoId: 'fechamento-porta',
    acaoId: 'noe.abrigo.chamado-ouvido',
    unidadeId: 'chamado-final-noe',
    posicao: [-4.2, 0.9, 1.8],
    raio: 2.3,
    prioridade: PRIORIDADE_ABRIGO,
    etapa: 1,
    ordem: 1,
    tipoVisual: 'chamado',
  },
  {
    id: 'abrigo-entrada-segura',
    momentoId: 'fechamento-porta',
    acaoId: 'noe.abrigo.entrada-concluida',
    unidadeId: 'entrada-segura-na-arca',
    posicao: [0, 0.75, -5.2],
    raio: 2.1,
    prioridade: PRIORIDADE_ABRIGO,
    etapa: 2,
    ordem: 2,
    tipoVisual: 'entrada',
  },
  {
    id: 'abrigo-porta-segura',
    momentoId: 'fechamento-porta',
    acaoId: 'noe.porta.fechada',
    unidadeId: 'porta-da-arca-fechada',
    posicao: [0, 1.05, -3.35],
    raio: 1.85,
    prioridade: PRIORIDADE_ABRIGO,
    etapa: 3,
    ordem: 3,
    tipoVisual: 'porta',
  },
  {
    id: 'cuidado-filhotes-aves',
    momentoId: 'refugio-tempestade',
    acaoId: 'noe.cuidado.filhotes-aves',
    unidadeId: 'filhotes-aves-alimentados',
    posicao: [-3.65, 4.42, -24],
    raio: 1.9,
    prioridade: PRIORIDADE_ABRIGO,
    etapa: 1,
    ordem: 10,
    tipoVisual: 'filhotes-aves',
  },
  {
    id: 'cuidado-filhotes-herbivoros',
    momentoId: 'refugio-tempestade',
    acaoId: 'noe.cuidado.filhotes-herbivoros',
    unidadeId: 'filhotes-herbivoros-alimentados',
    posicao: [-3.85, 0.72, -24.35],
    raio: 1.9,
    prioridade: PRIORIDADE_ABRIGO,
    etapa: 1,
    ordem: 11,
    tipoVisual: 'filhotes-herbivoros',
  },
  {
    id: 'cuidado-filhotes-mamiferos',
    momentoId: 'refugio-tempestade',
    acaoId: 'noe.cuidado.filhotes-mamiferos',
    unidadeId: 'filhotes-mamiferos-alimentados',
    posicao: [3.65, 2.5, -23],
    raio: 1.9,
    prioridade: PRIORIDADE_ABRIGO,
    etapa: 1,
    ordem: 12,
    tipoVisual: 'filhotes-mamiferos',
  },
] as const

function momentoFoiConcluido(
  estado: EstadoProgressaoNoe,
  momentoId: MomentoNoeId,
): boolean {
  return estado.momentosConcluidos.includes(momentoId)
}

function unidadeFoiConcluida(
  estado: EstadoProgressaoNoe,
  tarefa: DescritorTarefaAbrigoNoe,
): boolean {
  if (momentoFoiConcluido(estado, tarefa.momentoId)) return true
  if (estado.momentoAtualId !== tarefa.momentoId) return false

  return (
    estado.progressoMomentoAtual
      .find(({ acaoId }) => acaoId === tarefa.acaoId)
      ?.unidadesConcluidas.includes(tarefa.unidadeId) ?? false
  )
}

function etapaDisponivel(
  estado: EstadoProgressaoNoe,
  tarefa: DescritorTarefaAbrigoNoe,
): boolean {
  return tarefasAbrigoTempestadeNoe
    .filter(
      (requisito) =>
        requisito.momentoId === tarefa.momentoId &&
        requisito.etapa < tarefa.etapa,
    )
    .every((requisito) => unidadeFoiConcluida(estado, requisito))
}

export function descreverTarefasAbrigoTempestadeNoe(
  estado: EstadoProgressaoNoe,
): readonly EstadoTarefaAbrigoNoe[] {
  return tarefasAbrigoTempestadeNoe.map((tarefa) => {
    const concluida = unidadeFoiConcluida(estado, tarefa)
    const noMomento = estado.momentoAtualId === tarefa.momentoId
    const estadoTarefa: EstadoCandidatoTarefaNoe = concluida
      ? 'concluida'
      : !noMomento
        ? 'fora-do-momento'
        : etapaDisponivel(estado, tarefa)
          ? 'disponivel'
          : 'bloqueada'

    return { ...tarefa, estado: estadoTarefa }
  })
}

export function resolverCandidatoAbrigoTempestadeNoe(
  posicaoJogador: PosicaoJogador,
  estado: EstadoProgressaoNoe,
): CandidatoAbrigoTempestadeNoePuro | null {
  const candidatos = descreverTarefasAbrigoTempestadeNoe(estado).flatMap(
    (tarefa) => {
      if (tarefa.estado !== 'disponivel') return []
      const distancia = distancia3D(posicaoJogador, {
        x: tarefa.posicao[0],
        y: tarefa.posicao[1],
        z: tarefa.posicao[2],
      })
      return distancia <= tarefa.raio
        ? [{ ...tarefa, estado: 'disponivel' as const, distancia }]
        : []
    },
  )

  return (
    candidatos.sort(
      (a, b) =>
        a.distancia - b.distancia ||
        a.ordem - b.ordem ||
        a.id.localeCompare(b.id),
    )[0] ?? null
  )
}

function momentoJaFoiApresentado(
  estado: EstadoProgressaoNoe,
  momentoId: MomentoNoeId,
): boolean {
  return (
    momentoFoiConcluido(estado, momentoId) ||
    indiceMomentoNoe(estado.momentoAtualId) >= indiceMomentoNoe(momentoId)
  )
}

export function obterEstadoVisualAbrigoNoe(
  estado: EstadoProgressaoNoe,
): EstadoVisualAbrigoNoe {
  const tarefas = descreverTarefasAbrigoTempestadeNoe(estado)
  const concluiu = (tipoVisual: TipoVisualTarefaAbrigoNoe) =>
    tarefas.some(
      (tarefa) =>
        tarefa.tipoVisual === tipoVisual && tarefa.estado === 'concluida',
    )
  const noDesembarque = estado.momentoAtualId === 'nova-terra-arco-iris'

  return {
    chamadoOuvido: concluiu('chamado'),
    entradaConcluida: concluiu('entrada'),
    porta: concluiu('porta') && !noDesembarque ? 'fechada' : 'aberta',
    interiorAcolhedor: momentoJaFoiApresentado(
      estado,
      'acomodacao-animais',
    ),
    cuidadosConcluidos: tarefas
      .filter(
        ({ momentoId, estado: estadoTarefa }) =>
          momentoId === 'refugio-tempestade' && estadoTarefa === 'concluida',
      )
      .map(({ tipoVisual }) => tipoVisual),
  }
}

const PARAMETROS_ATMOSFERA: Readonly<
  Record<
    PercentualPreparacaoNoe,
    Omit<
      ProjecaoAtmosferaNoe,
      'percentualPreparacao' | 'chuvaExteriorAtiva'
    >
  >
> = {
  0: {
    densidadeNuvens: 0,
    intensidadeVento: 0,
    corCeu: '#98d8ee',
    corNuvem: '#f6f2df',
  },
  33: {
    densidadeNuvens: 0.33,
    intensidadeVento: 0.25,
    corCeu: '#8fc1d1',
    corNuvem: '#d9d7cf',
  },
  66: {
    densidadeNuvens: 0.66,
    intensidadeVento: 0.55,
    corCeu: '#7797a4',
    corNuvem: '#aeb5b5',
  },
  100: {
    densidadeNuvens: 1,
    intensidadeVento: 0.72,
    corCeu: '#687f8b',
    corNuvem: '#8c9699',
  },
}

export function projetarAtmosferaNoe(
  estado: EstadoProgressaoNoe,
): ProjecaoAtmosferaNoe {
  const clima = obterClimaNoe(estado)
  const parametros =
    clima.fase === 'luz-retornando'
      ? {
          densidadeNuvens: 0.22 as const,
          intensidadeVento: 0.12 as const,
          corCeu: '#9bcfdd',
          corNuvem: '#e7e8df',
        }
      : clima.fase === 'nova-terra'
        ? {
            densidadeNuvens: 0 as const,
            intensidadeVento: 0 as const,
            corCeu: '#91d8ec',
            corNuvem: '#f7f3df',
          }
        : PARAMETROS_ATMOSFERA[clima.percentualPreparacao]
  const portaSegura = obterEstadoVisualAbrigoNoe(estado).porta === 'fechada'

  return {
    percentualPreparacao: clima.percentualPreparacao,
    ...parametros,
    chuvaExteriorAtiva: clima.chuvaAtiva && portaSegura,
  }
}

export const limitesExternosArcaNoe = {
  xMin: -6.2,
  xMax: 6.2,
  zMin: -30.2,
  zMax: -1.8,
} as const

/** Rain points are rejected from the ark footprint, including its walls. */
export function posicaoForaDaArcaNoe(posicao: Ponto3D): boolean {
  const [x, , z] = posicao
  const dentroDaProjecao =
    x >= limitesExternosArcaNoe.xMin &&
    x <= limitesExternosArcaNoe.xMax &&
    z >= limitesExternosArcaNoe.zMin &&
    z <= limitesExternosArcaNoe.zMax
  return !dentroDaProjecao
}

/** Stable pseudo-random distribution: repeatable tests and no hydration drift. */
export function gerarGotasChuvaExteriorNoe(
  quantidade = 64,
  sementeInicial = 7_131,
): readonly Ponto3D[] {
  const gotas: Ponto3D[] = []
  let semente = sementeInicial >>> 0
  const proximo = () => {
    semente = (Math.imul(semente, 1_664_525) + 1_013_904_223) >>> 0
    return semente / 4_294_967_296
  }

  for (let tentativa = 0; gotas.length < quantidade && tentativa < quantidade * 12; tentativa += 1) {
    const posicao: Ponto3D = [
      -44 + proximo() * 88,
      3.5 + proximo() * 14,
      -44 + proximo() * 88,
    ]
    if (posicaoForaDaArcaNoe(posicao)) gotas.push(posicao)
  }

  return gotas
}
