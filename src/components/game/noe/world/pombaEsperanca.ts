import type { Ponto3D } from '../../../../mapas/types'
import { distancia3D, type PosicaoJogador } from '../../creation/proximidade'
import { indiceMomentoNoe } from '../progression/estado'
import type {
  AcaoNoeId,
  EstadoProgressaoNoe,
  MomentoNoeId,
} from '../progression/types'
import type { EstadoCandidatoTarefaNoe } from './types'

export type AcaoPombaEsperancaNoeId = Extract<
  AcaoNoeId,
  'noe.pomba.enviada' | 'noe.pomba.retornou'
>

export type FaseVisualPombaNoe =
  | 'aguardando-envio'
  | 'retornando-com-oliveira'
  | 'pousada-com-oliveira'

export type LocalizacaoPombaEsperancaNoe =
  | 'oculta'
  | 'janela-superior'
  | 'nova-terra'

export interface ProjecaoLocalizacaoPombaEsperancaNoe {
  localizacao: LocalizacaoPombaEsperancaNoe
  posicaoJanela: Ponto3D
  posicaoPomba: Ponto3D | null
}

export interface DescritorTarefaPombaNoe {
  id: string
  acaoId: AcaoPombaEsperancaNoeId
  unidadeId: 'envio-janela-superior' | 'retorno-com-oliveira'
  posicao: Ponto3D
  raio: number
  prioridade: number
  etapa: 1 | 2
  ordem: number
}

export interface EstadoTarefaPombaNoe extends DescritorTarefaPombaNoe {
  estado: EstadoCandidatoTarefaNoe
}

export interface CandidatoPombaEsperancaNoePuro
  extends DescritorTarefaPombaNoe {
  tipo: 'tarefa'
  distancia: number
}

export interface EstadoVisualPombaEsperancaNoe
  extends ProjecaoLocalizacaoPombaEsperancaNoe {
  visivel: boolean
  fase: FaseVisualPombaNoe
  carregaRamoOliveira: boolean
  janelaIluminada: boolean
}

const PRIORIDADE_POMBA = 380

export const POSICAO_JANELA_SUPERIOR_POMBA_NOE: Ponto3D = [
  0, 4.7, -28.35,
]
export const POSICAO_POMBA_NOVA_TERRA_NOE: Ponto3D = [-3.4, 0.18, 32]

/** The interaction sits on the accessible upper deck, beside the stern window. */
export const tarefasPombaEsperancaNoe: readonly DescritorTarefaPombaNoe[] = [
  {
    id: 'pomba-envio-janela-superior',
    acaoId: 'noe.pomba.enviada',
    unidadeId: 'envio-janela-superior',
    posicao: POSICAO_JANELA_SUPERIOR_POMBA_NOE,
    raio: 2.35,
    prioridade: PRIORIDADE_POMBA,
    etapa: 1,
    ordem: 1,
  },
  {
    id: 'pomba-retorno-com-oliveira',
    acaoId: 'noe.pomba.retornou',
    unidadeId: 'retorno-com-oliveira',
    posicao: POSICAO_JANELA_SUPERIOR_POMBA_NOE,
    raio: 2.35,
    prioridade: PRIORIDADE_POMBA,
    etapa: 2,
    ordem: 2,
  },
] as const

function momentoConcluido(
  estado: EstadoProgressaoNoe,
  momentoId: MomentoNoeId,
): boolean {
  return estado.momentosConcluidos.includes(momentoId)
}

function unidadeConcluida(
  estado: EstadoProgressaoNoe,
  tarefa: DescritorTarefaPombaNoe,
): boolean {
  if (momentoConcluido(estado, 'retorno-pomba')) return true
  if (estado.momentoAtualId !== 'retorno-pomba') return false

  return (
    estado.progressoMomentoAtual
      .find(({ acaoId }) => acaoId === tarefa.acaoId)
      ?.unidadesConcluidas.includes(tarefa.unidadeId) ?? false
  )
}

function pombaJaFoiApresentada(estado: EstadoProgressaoNoe): boolean {
  return (
    momentoConcluido(estado, 'retorno-pomba') ||
    indiceMomentoNoe(estado.momentoAtualId) >=
      indiceMomentoNoe('retorno-pomba')
  )
}

/** Keeps the ark window fixed while moving only the dove after M8. */
export function projetarLocalizacaoPombaEsperancaNoe(
  estado: EstadoProgressaoNoe,
): ProjecaoLocalizacaoPombaEsperancaNoe {
  if (!pombaJaFoiApresentada(estado)) {
    return {
      localizacao: 'oculta',
      posicaoJanela: POSICAO_JANELA_SUPERIOR_POMBA_NOE,
      posicaoPomba: null,
    }
  }

  const naNovaTerra =
    estado.momentoAtualId === 'nova-terra-arco-iris' ||
    momentoConcluido(estado, 'retorno-pomba')

  return {
    localizacao: naNovaTerra ? 'nova-terra' : 'janela-superior',
    posicaoJanela: POSICAO_JANELA_SUPERIOR_POMBA_NOE,
    posicaoPomba: naNovaTerra
      ? POSICAO_POMBA_NOVA_TERRA_NOE
      : POSICAO_JANELA_SUPERIOR_POMBA_NOE,
  }
}

export function descreverTarefasPombaEsperancaNoe(
  estado: EstadoProgressaoNoe,
): readonly EstadoTarefaPombaNoe[] {
  const noMomento = estado.momentoAtualId === 'retorno-pomba' && !estado.concluida

  return tarefasPombaEsperancaNoe.map((tarefa) => {
    const concluida = unidadeConcluida(estado, tarefa)
    const etapasAnterioresConcluidas = tarefasPombaEsperancaNoe
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

/** Resolves M8 without timers or keyboard ownership. */
export function resolverCandidatoPombaEsperancaNoe(
  posicaoJogador: PosicaoJogador,
  estado: EstadoProgressaoNoe,
): CandidatoPombaEsperancaNoePuro | null {
  const candidatos = descreverTarefasPombaEsperancaNoe(estado).flatMap(
    (tarefa) => {
      if (tarefa.estado !== 'disponivel') return []
      const distancia = distancia3D(posicaoJogador, {
        x: tarefa.posicao[0],
        y: tarefa.posicao[1],
        z: tarefa.posicao[2],
      })
      if (distancia > tarefa.raio) return []

      return [{ ...tarefa, tipo: 'tarefa' as const, distancia }]
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

/** Durable scene projection: the olive branch remains after M8 advances. */
export function obterEstadoVisualPombaEsperancaNoe(
  estado: EstadoProgressaoNoe,
): EstadoVisualPombaEsperancaNoe {
  const tarefas = descreverTarefasPombaEsperancaNoe(estado)
  const enviada = tarefas[0].estado === 'concluida'
  const retornou = tarefas[1].estado === 'concluida'
  const localizacao = projetarLocalizacaoPombaEsperancaNoe(estado)

  return {
    ...localizacao,
    visivel: localizacao.localizacao !== 'oculta',
    fase: retornou
      ? 'pousada-com-oliveira'
      : enviada
        ? 'retornando-com-oliveira'
        : 'aguardando-envio',
    carregaRamoOliveira: enviada,
    janelaIluminada:
      localizacao.localizacao === 'janela-superior' && !retornou,
  }
}
