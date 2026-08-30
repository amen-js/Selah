import type { Ponto3D } from '../../../../mapas/types'
import { distancia3D, type PosicaoJogador } from '../../creation/proximidade'
import { indiceMomentoNoe } from '../progression/estado'
import type {
  AcaoNoeId,
  MomentoNoeId,
  ProgressoAcaoNoe,
} from '../progression/types'

export type AcaoMantimentoNoeId = Extract<
  AcaoNoeId,
  | 'noe.mantimento.feno-armazenado'
  | 'noe.mantimento.graos-armazenados'
  | 'noe.mantimento.agua-armazenada'
  | 'noe.mantimento.frutas-armazenadas'
>

export type TipoMantimentoNoe = 'feno' | 'graos' | 'agua' | 'frutas'
export type EtapaInteracaoMantimentoNoe = 'coleta' | 'entrega'

export interface DescritorMantimentoNoe {
  id: TipoMantimentoNoe
  acaoId: AcaoMantimentoNoeId
  unidadeId: string
  posicaoColeta: Ponto3D
  posicaoDestino: Ponto3D
  destino:
    | 'estabulos-inferiores'
    | 'poleiros-superiores'
    | 'reserva-central'
    | 'despensa-central'
  ordem: number
}

export interface CandidatoMantimentoNoePuro {
  id: string
  acaoId: AcaoMantimentoNoeId
  unidadeId: string
  posicao: Ponto3D
  raio: number
  prioridade: number
  etapaInteracao: EtapaInteracaoMantimentoNoe
  mantimentoId: TipoMantimentoNoe
}

export interface EstadoMantimentoNoe {
  descritor: DescritorMantimentoNoe
  concluido: boolean
  carregado: boolean
  mostrarNaColeta: boolean
  mostrarNoDestino: boolean
}

export const POSICAO_ARCA_NOE: Ponto3D = [0, 0, -16]

/**
 * World-space positions keep the detector independent from the visual group.
 * Pickups stay beside the entrance, while every destination communicates its
 * future animal use inside one of the three decks.
 */
export const mantimentosArcaNoe: readonly DescritorMantimentoNoe[] = [
  {
    id: 'feno',
    acaoId: 'noe.mantimento.feno-armazenado',
    unidadeId: 'feno-estabulos-inferiores',
    posicaoColeta: [-8.6, 0.55, 2.2],
    posicaoDestino: [-3.85, 0.72, -24.5],
    destino: 'estabulos-inferiores',
    ordem: 1,
  },
  {
    id: 'graos',
    acaoId: 'noe.mantimento.graos-armazenados',
    unidadeId: 'graos-poleiros-superiores',
    posicaoColeta: [-5.4, 0.5, 3.5],
    posicaoDestino: [-3.55, 4.45, -23.8],
    destino: 'poleiros-superiores',
    ordem: 2,
  },
  {
    id: 'agua',
    acaoId: 'noe.mantimento.agua-armazenada',
    unidadeId: 'agua-reserva-central',
    posicaoColeta: [5.4, 0.55, 3.5],
    posicaoDestino: [3.55, 2.55, -19.7],
    destino: 'reserva-central',
    ordem: 3,
  },
  {
    id: 'frutas',
    acaoId: 'noe.mantimento.frutas-armazenadas',
    unidadeId: 'frutas-despensa-central',
    posicaoColeta: [8.6, 0.55, 2.2],
    posicaoDestino: [-3.55, 2.55, -19.7],
    destino: 'despensa-central',
    ordem: 4,
  },
] as const

export const estruturaConvesesArcaNoe = {
  posicaoArca: POSICAO_ARCA_NOE,
  niveis: [
    { id: 'inferior', alturaPiso: 0.44, funcao: 'grandes-animais-e-suprimentos' },
    { id: 'medio', alturaPiso: 2.22, funcao: 'pequenos-mamiferos' },
    { id: 'superior', alturaPiso: 4.12, funcao: 'aves-e-familia' },
  ],
  plataformas: [
    {
      id: 'plataforma-media-fundo',
      posicaoLocal: [0, 2.12, -6.1] as Ponto3D,
      meiaExtensao: [5.25, 0.1, 6.7] as Ponto3D,
    },
    {
      id: 'plataforma-media-frente-direita',
      posicaoLocal: [1.35, 2.12, 2.4] as Ponto3D,
      meiaExtensao: [3.9, 0.1, 2.4] as Ponto3D,
    },
    {
      id: 'plataforma-superior-fundo',
      posicaoLocal: [0, 4.02, -8.4] as Ponto3D,
      meiaExtensao: [5.25, 0.1, 4.4] as Ponto3D,
    },
    {
      id: 'plataforma-superior-frente-esquerda',
      posicaoLocal: [-1.35, 4.02, -2.95] as Ponto3D,
      meiaExtensao: [3.9, 0.1, 1.45] as Ponto3D,
    },
  ],
  acessos: [
    {
      id: 'rampa-inferior-media',
      posicaoLocal: [-3.75, 1.24, 4.15] as Ponto3D,
      meiaExtensao: [1.05, 0.09, 3.8] as Ponto3D,
      rotacao: [Math.asin(1.78 / 7.6), 0, 0] as Ponto3D,
      liga: ['inferior', 'medio'] as const,
    },
    {
      id: 'rampa-media-superior',
      posicaoLocal: [3.75, 3.083, -0.35] as Ponto3D,
      meiaExtensao: [1.05, 0.09, 3.95] as Ponto3D,
      rotacao: [Math.asin(1.9 / 7.9), 0, 0] as Ponto3D,
      liga: ['medio', 'superior'] as const,
    },
  ],
} as const

function unidadesConcluidasPorAcao(
  progressoMomentoAtual: readonly ProgressoAcaoNoe[],
): ReadonlyMap<AcaoNoeId, ReadonlySet<string>> {
  const porAcao = new Map<AcaoNoeId, Set<string>>()
  for (const { acaoId, unidadesConcluidas } of progressoMomentoAtual) {
    const acumuladas = porAcao.get(acaoId) ?? new Set<string>()
    for (const unidadeId of unidadesConcluidas) {
      acumuladas.add(unidadeId.trim())
    }
    porAcao.set(acaoId, acumuladas)
  }
  return porAcao
}

export function mantimentoConcluidoNoe(
  mantimento: DescritorMantimentoNoe,
  momentoAtualId: MomentoNoeId,
  progressoMomentoAtual: readonly ProgressoAcaoNoe[],
): boolean {
  const indiceAtual = indiceMomentoNoe(momentoAtualId)
  const indiceM3 = indiceMomentoNoe('estoque-mantimentos')
  if (indiceAtual < indiceM3) return false
  if (indiceAtual > indiceM3) return true

  return (
    unidadesConcluidasPorAcao(progressoMomentoAtual)
      .get(mantimento.acaoId)
      ?.has(mantimento.unidadeId) ?? false
  )
}

export function descreverEstadoMantimentosNoe(
  momentoAtualId: MomentoNoeId,
  progressoMomentoAtual: readonly ProgressoAcaoNoe[],
  mantimentoCarregadoId: TipoMantimentoNoe | null,
): readonly EstadoMantimentoNoe[] {
  const m3Ativo = momentoAtualId === 'estoque-mantimentos'

  return mantimentosArcaNoe.map((descritor) => {
    const concluido = mantimentoConcluidoNoe(
      descritor,
      momentoAtualId,
      progressoMomentoAtual,
    )
    const carregado =
      m3Ativo && !concluido && mantimentoCarregadoId === descritor.id

    return {
      descritor,
      concluido,
      carregado,
      mostrarNaColeta: m3Ativo && !concluido && !carregado,
      mostrarNoDestino: concluido,
    }
  })
}

const RAIO_INTERACAO_MANTIMENTO = 1.8
const PRIORIDADE_MANTIMENTO = 320

/**
 * Returns one two-stage interaction: any unfinished pickup while empty-handed,
 * then exclusively the matching destination while carrying an item.
 */
export function resolverCandidatoMantimentoNoe(
  posicaoJogador: PosicaoJogador,
  momentoAtualId: MomentoNoeId,
  progressoMomentoAtual: readonly ProgressoAcaoNoe[],
  mantimentoCarregadoId: TipoMantimentoNoe | null,
): CandidatoMantimentoNoePuro | null {
  if (momentoAtualId !== 'estoque-mantimentos') return null

  const estados = descreverEstadoMantimentosNoe(
    momentoAtualId,
    progressoMomentoAtual,
    mantimentoCarregadoId,
  )
  const candidatos = estados.flatMap((estado) => {
    if (estado.concluido) return []

    const etapaInteracao: EtapaInteracaoMantimentoNoe =
      mantimentoCarregadoId === estado.descritor.id ? 'entrega' : 'coleta'
    if (
      (mantimentoCarregadoId && etapaInteracao === 'coleta') ||
      (!mantimentoCarregadoId && etapaInteracao === 'entrega')
    ) {
      return []
    }

    const posicao =
      etapaInteracao === 'coleta'
        ? estado.descritor.posicaoColeta
        : estado.descritor.posicaoDestino
    const distancia = distancia3D(posicaoJogador, {
      x: posicao[0],
      y: posicao[1],
      z: posicao[2],
    })
    if (distancia > RAIO_INTERACAO_MANTIMENTO) return []

    return [
      {
        id: `mantimento-${etapaInteracao}-${estado.descritor.id}`,
        acaoId: estado.descritor.acaoId,
        unidadeId: estado.descritor.unidadeId,
        posicao,
        raio: RAIO_INTERACAO_MANTIMENTO,
        prioridade: PRIORIDADE_MANTIMENTO,
        etapaInteracao,
        mantimentoId: estado.descritor.id,
        distancia,
        ordem: estado.descritor.ordem,
      },
    ]
  })

  const maisProximo = candidatos.sort(
    (a, b) =>
      a.distancia - b.distancia ||
      a.ordem - b.ordem ||
      a.id.localeCompare(b.id),
  )[0]
  if (!maisProximo) return null

  return {
    id: maisProximo.id,
    acaoId: maisProximo.acaoId,
    unidadeId: maisProximo.unidadeId,
    posicao: maisProximo.posicao,
    raio: maisProximo.raio,
    prioridade: maisProximo.prioridade,
    etapaInteracao: maisProximo.etapaInteracao,
    mantimentoId: maisProximo.mantimentoId,
  }
}
