import type { Ponto3D } from '../../../../mapas/types'
import { distancia3D, type PosicaoJogador } from '../../creation/proximidade'
import { indiceMomentoNoe } from '../progression/estado'
import type { MomentoNoeId, ProgressoAcaoNoe } from '../progression/types'
import type {
  CandidatoTarefaNoe,
  DescritorTarefaCanteiroNoe,
  InstanciaAssetCanteiroNoe,
} from './types'

export interface ColisorCuboidCanteiroNoe {
  id: string
  tipo: 'cuboid'
  meiaExtensao: Ponto3D
  posicao: Ponto3D
  rotacao?: Ponto3D
}

export const estruturaArcaCanteiroNoe = {
  posicao: [0, 0, -16] as Ponto3D,
  largura: 12,
  comprimento: 28,
  alturaParede: 6,
  espessuraPiso: 0.44,
  entrada: {
    larguraLivre: 2.8,
    alturaLivre: 3.2,
    centroLocal: [0, 2.04, 14] as Ponto3D,
  },
  interior: {
    // Measured between the inner faces of the explicit side/end colliders.
    larguraLivre: 10.88,
    comprimentoLivre: 26.88,
    alturaLivre: 5.56,
  },
} as const

/**
 * Primitive compound body. The entrance is deliberately split into two side
 * panels plus a lintel, so no invisible full-hull collider seals the ark.
 */
export const colisoresArcaCanteiroNoe: readonly ColisorCuboidCanteiroNoe[] = [
  {
    id: 'arca-piso',
    tipo: 'cuboid',
    meiaExtensao: [6, 0.22, 14],
    posicao: [0, 0.22, 0],
  },
  {
    id: 'arca-parede-esquerda',
    tipo: 'cuboid',
    meiaExtensao: [0.28, 2.78, 13.72],
    posicao: [-5.72, 3.22, 0],
  },
  {
    id: 'arca-parede-direita',
    tipo: 'cuboid',
    meiaExtensao: [0.28, 2.78, 13.72],
    posicao: [5.72, 3.22, 0],
  },
  {
    id: 'arca-parede-traseira',
    tipo: 'cuboid',
    meiaExtensao: [5.44, 2.78, 0.28],
    posicao: [0, 3.22, -13.72],
  },
  {
    id: 'arca-frente-esquerda',
    tipo: 'cuboid',
    meiaExtensao: [2.16, 2.78, 0.28],
    posicao: [-3.56, 3.22, 13.72],
  },
  {
    id: 'arca-frente-direita',
    tipo: 'cuboid',
    meiaExtensao: [2.16, 2.78, 0.28],
    posicao: [3.56, 3.22, 13.72],
  },
  {
    id: 'arca-verga-entrada',
    tipo: 'cuboid',
    meiaExtensao: [1.4, 1.18, 0.28],
    posicao: [0, 4.82, 13.72],
  },
  {
    id: 'arca-teto',
    tipo: 'cuboid',
    meiaExtensao: [5.44, 0.18, 13.72],
    posicao: [0, 6.18, 0],
  },
]

const COMPRIMENTO_RAMPA = 7
const DESNIVEL_RAMPA = estruturaArcaCanteiroNoe.espessuraPiso
const MEIA_ESPESSURA_RAMPA = 0.09
const ANGULO_RAMPA = Math.asin(DESNIVEL_RAMPA / COMPRIMENTO_RAMPA)
const MEIO_COMPRIMENTO_RAMPA = COMPRIMENTO_RAMPA / 2
const FRENTE_ARCA_Z =
  estruturaArcaCanteiroNoe.posicao[2] + estruturaArcaCanteiroNoe.comprimento / 2
const CENTRO_RAMPA_Y =
  DESNIVEL_RAMPA / 2 - MEIA_ESPESSURA_RAMPA * Math.cos(ANGULO_RAMPA)
const CENTRO_RAMPA_Z =
  FRENTE_ARCA_Z -
  MEIA_ESPESSURA_RAMPA * Math.sin(ANGULO_RAMPA) +
  MEIO_COMPRIMENTO_RAMPA * Math.cos(ANGULO_RAMPA)

export const estruturaRampaCanteiroNoe = {
  largura: 3.4,
  comprimento: COMPRIMENTO_RAMPA,
  desnivel: DESNIVEL_RAMPA,
  inclinacaoRadianos: ANGULO_RAMPA,
  inclinacaoGraus: (ANGULO_RAMPA * 180) / Math.PI,
  colisor: {
    id: 'rampa-principal-colisor',
    tipo: 'cuboid',
    meiaExtensao: [1.7, MEIA_ESPESSURA_RAMPA, MEIO_COMPRIMENTO_RAMPA],
    // The upper top edge meets the floor/front edge and the lower top edge
    // meets y=0 after rotation (including the plank half-thickness).
    posicao: [0, CENTRO_RAMPA_Y, CENTRO_RAMPA_Z],
    rotacao: [ANGULO_RAMPA, 0, 0],
  } satisfies ColisorCuboidCanteiroNoe,
} as const

const PRIORIDADE_TAREFA = 300

/**
 * Reused visual-only hills frame both sides of the valley. Their closest edge
 * stays well outside the central approach to the ark and they never create a
 * physics body, so the authored mesh cannot snag or block the player.
 */
export const instanciasRelevoValeNoe: readonly InstanciaAssetCanteiroNoe[] = [
  {
    id: 'm1-morro-oeste-norte',
    chunkId: 'canteiro-m1',
    assetId: 'vale-pedra-morro',
    posicao: [-41, 0, -28],
    rotacao: [0, 0.35, 0],
    escala: 2.15,
  },
  {
    id: 'm1-morro-oeste-centro',
    chunkId: 'canteiro-m1',
    assetId: 'vale-pedra-morro',
    posicao: [-42, 0, 0],
    rotacao: [0, -0.55, 0],
    escala: 2,
  },
  {
    id: 'm1-morro-oeste-sul',
    chunkId: 'canteiro-m1',
    assetId: 'vale-pedra-morro',
    posicao: [-40, 0, 28],
    rotacao: [0, 0.8, 0],
    escala: 1.9,
  },
  {
    id: 'm1-morro-leste-norte',
    chunkId: 'canteiro-m1',
    assetId: 'vale-pedra-morro',
    posicao: [41, 0, -28],
    rotacao: [0, -0.25, 0],
    escala: 2.15,
  },
  {
    id: 'm1-morro-leste-centro',
    chunkId: 'canteiro-m1',
    assetId: 'vale-pedra-morro',
    posicao: [42, 0, 0],
    rotacao: [0, 0.6, 0],
    escala: 2,
  },
  {
    id: 'm1-morro-leste-sul',
    chunkId: 'canteiro-m1',
    assetId: 'vale-pedra-morro',
    posicao: [40, 0, 28],
    rotacao: [0, -0.9, 0],
    escala: 1.9,
  },
]

export const tarefasCanteiroNoe: readonly DescritorTarefaCanteiroNoe[] = [
  {
    id: 'tarefa-noe-chamado',
    momentoId: 'chamado-canteiro',
    etapa: 'chamado',
    ordem: 1,
    acaoId: 'noe.chamado.confirmado',
    unidadeId: 'chamado-noe',
    posicao: [-10.5, 0.9, 9.5],
    raio: 2.5,
    prioridade: PRIORIDADE_TAREFA,
    estado: 'fora-do-momento',
    prerequisitos: [],
  },
  ...(
    [
      ['tabua-1', [-15, 0.45, 11]],
      ['tabua-2', [-14, 0.45, 17]],
      ['tabua-3', [13, 0.45, 13]],
      ['tabua-4', [16, 0.45, 8]],
    ] as const
  ).map(([unidadeId, posicao], indice): DescritorTarefaCanteiroNoe => ({
    id: `tarefa-noe-${unidadeId}`,
    momentoId: 'coleta-vedacao',
    etapa: 'madeira',
    ordem: 10 + indice,
    acaoId: 'noe.madeira.coletada',
    unidadeId,
    posicao,
    raio: 2,
    prioridade: PRIORIDADE_TAREFA,
    estado: 'fora-do-momento',
    assetId: 'canteiro-tabuas',
    prerequisitos: [],
  })),
  {
    id: 'tarefa-noe-rampa-principal',
    momentoId: 'coleta-vedacao',
    etapa: 'rampa',
    ordem: 20,
    acaoId: 'noe.rampa.reparada',
    unidadeId: 'rampa-principal',
    posicao: [0, 0.65, 4],
    raio: 2.2,
    prioridade: PRIORIDADE_TAREFA,
    estado: 'fora-do-momento',
    prerequisitos: ['tabua-1', 'tabua-2', 'tabua-3', 'tabua-4'],
  },
  ...(
    [
      ['fenda-casco-1', [-3.2, 1.7, -1.7]],
      ['fenda-casco-2', [3.2, 2.4, -1.7]],
      ['fenda-casco-3', [5.7, 1.6, -10]],
    ] as const
  ).map(([unidadeId, posicao], indice): DescritorTarefaCanteiroNoe => ({
    id: `tarefa-noe-${unidadeId}`,
    momentoId: 'coleta-vedacao',
    etapa: 'vedacao',
    ordem: 30 + indice,
    acaoId: 'noe.betume.aplicado',
    unidadeId,
    posicao,
    raio: 2.2,
    prioridade: PRIORIDADE_TAREFA,
    estado: 'fora-do-momento',
    prerequisitos: ['rampa-principal'],
  })),
]

const instanciasM1: readonly InstanciaAssetCanteiroNoe[] = [
  ...instanciasRelevoValeNoe,
  {
    id: 'm1-bancada',
    chunkId: 'canteiro-m1',
    assetId: 'canteiro-bancada',
    posicao: [-11, 0, 11],
    rotacao: [0, 0.2, 0],
  },
  {
    id: 'm1-machado',
    chunkId: 'canteiro-m1',
    assetId: 'canteiro-machado',
    posicao: [-11.3, 0.77, 10.85],
    rotacao: [0, 0, -0.35],
  },
  {
    id: 'm1-martelo',
    chunkId: 'canteiro-m1',
    assetId: 'canteiro-martelo',
    posicao: [-10.7, 0.77, 10.9],
    rotacao: [0, 0.8, 1.15],
  },
  {
    id: 'm1-balde',
    chunkId: 'canteiro-m1',
    assetId: 'canteiro-balde',
    posicao: [-8.8, 0, 11.5],
  },
  {
    id: 'm1-barril',
    chunkId: 'canteiro-m1',
    assetId: 'canteiro-barril',
    posicao: [-12.6, 0, 13],
  },
  {
    id: 'm1-caixa',
    chunkId: 'canteiro-m1',
    assetId: 'canteiro-caixa',
    posicao: [-10.5, 0, 14],
    rotacao: [0, -0.25, 0],
  },
]

const posicaoTabuaPorUnidade = new Map(
  tarefasCanteiroNoe
    .filter(({ etapa }) => etapa === 'madeira')
    .map(({ unidadeId, posicao }) => [unidadeId, posicao]),
)

const instanciasM2: readonly InstanciaAssetCanteiroNoe[] = [
  ...(['tabua-1', 'tabua-2', 'tabua-3', 'tabua-4'] as const).map(
    (unidadeId, indice): InstanciaAssetCanteiroNoe => ({
      id: `m2-${unidadeId}`,
      chunkId: 'canteiro-m2',
      assetId: 'canteiro-tabuas',
      posicao: posicaoTabuaPorUnidade.get(unidadeId) ?? [0, 0, 0],
      rotacao: [0, indice * 0.75 - 0.8, 0],
      unidadeId,
    }),
  ),
  {
    id: 'm2-madeira-ambiente',
    chunkId: 'canteiro-m2',
    assetId: 'canteiro-madeira',
    posicao: [10, 0, 18],
    rotacao: [0, 0.4, 0],
  },
  {
    id: 'm2-tronco-longo',
    chunkId: 'canteiro-m2',
    assetId: 'canteiro-tronco',
    posicao: [-18, 0, 5],
    rotacao: [0, 0.75, 0],
  },
  {
    id: 'm2-tronco-curto',
    chunkId: 'canteiro-m2',
    assetId: 'canteiro-tronco-curto',
    posicao: [18, 0, 4],
    rotacao: [0, -0.5, 0],
  },
]

export const instanciasAssetsCanteiroNoe = {
  'canteiro-m1': instanciasM1,
  'canteiro-m2': instanciasM2,
} as const

function unidadesConcluidas(
  progressoMomentoAtual: readonly ProgressoAcaoNoe[],
): ReadonlySet<string> {
  return new Set(
    progressoMomentoAtual.flatMap(({ unidadesConcluidas }) =>
      unidadesConcluidas.map((unidadeId) => unidadeId.trim()),
    ),
  )
}

export function descreverTarefasCanteiroNoe(
  momentoAtualId: MomentoNoeId,
  progressoMomentoAtual: readonly ProgressoAcaoNoe[],
): readonly DescritorTarefaCanteiroNoe[] {
  const concluidas = unidadesConcluidas(progressoMomentoAtual)

  return tarefasCanteiroNoe.map((tarefa) => {
    let estado = tarefa.estado
    if (tarefa.momentoId === momentoAtualId) {
      estado = concluidas.has(tarefa.unidadeId)
        ? 'concluida'
        : tarefa.prerequisitos.every((id) => concluidas.has(id))
          ? 'disponivel'
          : 'bloqueada'
    }
    return { ...tarefa, estado }
  })
}

export function obterTarefasDisponiveisCanteiroNoe(
  momentoAtualId: MomentoNoeId,
  progressoMomentoAtual: readonly ProgressoAcaoNoe[],
): readonly DescritorTarefaCanteiroNoe[] {
  return descreverTarefasCanteiroNoe(
    momentoAtualId,
    progressoMomentoAtual,
  ).filter(({ estado }) => estado === 'disponivel')
}

export function selecionarInstanciasAssetsCanteiroNoe(
  momentoAtualId: MomentoNoeId,
  progressoMomentoAtual: readonly ProgressoAcaoNoe[],
): readonly InstanciaAssetCanteiroNoe[] {
  const indiceAtual = indiceMomentoNoe(momentoAtualId)
  if (indiceAtual < 0) return []

  const concluidas = unidadesConcluidas(progressoMomentoAtual)
  const indiceColetaVedacao = indiceMomentoNoe('coleta-vedacao')
  const coletaVedacaoConcluida = indiceAtual > indiceColetaVedacao
  const chunks = [
    ...(indiceAtual >= indiceMomentoNoe('chamado-canteiro')
      ? instanciasM1
      : []),
    ...(indiceAtual >= indiceMomentoNoe('coleta-vedacao') ? instanciasM2 : []),
  ]

  return chunks.filter(
    ({ unidadeId }) =>
      !unidadeId ||
      (!coletaVedacaoConcluida && !concluidas.has(unidadeId)),
  )
}

/** Nearest available task, with stable priority/order/id tie-breaking. */
export function resolverCandidatoTarefaCanteiroNoe(
  posicaoJogador: PosicaoJogador,
  momentoAtualId: MomentoNoeId,
  progressoMomentoAtual: readonly ProgressoAcaoNoe[],
): CandidatoTarefaNoe | null {
  const dentroDoRaio = obterTarefasDisponiveisCanteiroNoe(
    momentoAtualId,
    progressoMomentoAtual,
  )
    .map((tarefa) => ({
      tarefa,
      distancia: distancia3D(posicaoJogador, {
        x: tarefa.posicao[0],
        y: tarefa.posicao[1],
        z: tarefa.posicao[2],
      }),
    }))
    .filter(({ tarefa, distancia }) => distancia <= tarefa.raio)
    .sort(
      (a, b) =>
        b.tarefa.prioridade - a.tarefa.prioridade ||
        a.distancia - b.distancia ||
        a.tarefa.ordem - b.tarefa.ordem ||
        a.tarefa.id.localeCompare(b.tarefa.id),
    )

  const candidato = dentroDoRaio[0]?.tarefa
  if (!candidato) return null

  return {
    id: candidato.id,
    acaoId: candidato.acaoId,
    unidadeId: candidato.unidadeId,
    posicao: candidato.posicao,
    raio: candidato.raio,
    prioridade: candidato.prioridade,
    estado: candidato.estado,
  }
}
