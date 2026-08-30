import { momentoCriacaoPorId, momentosCriacao } from './catalogo'
import { indiceMomentoCriacao } from './estado'
import type { MomentoCriacaoId } from './types'

const PRIMEIRA_PASSAGEM_CRIACAO = 'genesis-1-1'

const momentoMinimoPorPassagem = new Map<string, MomentoCriacaoId>([
  [PRIMEIRA_PASSAGEM_CRIACAO, 'vazio'],
  ...momentosCriacao.flatMap((momento) =>
    momento.gatilhoConclusao.tipo === 'selah-concluido'
      ? ([[momento.gatilhoConclusao.passagemId, momento.id]] as const)
      : [],
  ),
])

/** Keeps future Creation Selahs hidden while leaving unrelated map content alone. */
export function coletavelCriacaoDisponivelNoMomento(
  passagemId: string,
  momentoAtualId: MomentoCriacaoId,
): boolean {
  const momentoMinimo = momentoMinimoPorPassagem.get(passagemId)
  if (!momentoMinimo) return true

  return (
    indiceMomentoCriacao(momentoAtualId) >= indiceMomentoCriacao(momentoMinimo)
  )
}

export interface ObjetivoZonaCriacao {
  id: string
  posicao: readonly [number, number, number]
  raio: number
}

/** Returns a diegetic destination only for beats completed by spatial discovery. */
export function obterObjetivoZonaCriacao(
  momentoId: MomentoCriacaoId,
): ObjetivoZonaCriacao | null {
  const gatilho = momentoCriacaoPorId.get(momentoId)?.gatilhoConclusao
  if (!gatilho || gatilho.tipo !== 'zona-narrativa') return null

  return {
    id: gatilho.zonaId,
    posicao: gatilho.posicao,
    raio: gatilho.raio,
  }
}
