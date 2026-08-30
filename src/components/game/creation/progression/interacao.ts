import { momentoCriacaoPorId, momentosCriacao } from './catalogo'
import { indiceMomentoCriacao } from './estado'
import type { MomentoCriacaoId } from './types'

const momentoMinimoPorPassagem = new Map<string, MomentoCriacaoId>([
  ...momentosCriacao.flatMap((momento) =>
    momento.gatilhoConclusao.tipo === 'selah-concluido'
      ? ([[momento.gatilhoConclusao.passagemId, momento.id]] as const)
      : [],
  ),
])

/**
 * Exposes only Selahs that belong to the active Creation route. The optional
 * Genesis 1:1 crystal is intentionally excluded because it completes no beat.
 */
export function coletavelCriacaoDisponivelNoMomento(
  passagemId: string,
  momentoAtualId: MomentoCriacaoId,
): boolean {
  const momentoMinimo = momentoMinimoPorPassagem.get(passagemId)
  if (!momentoMinimo) return false

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
  jornadaConcluida = false,
): ObjetivoZonaCriacao | null {
  if (jornadaConcluida) return null
  const gatilho = momentoCriacaoPorId.get(momentoId)?.gatilhoConclusao
  if (!gatilho || gatilho.tipo !== 'zona-narrativa') return null

  return {
    id: gatilho.zonaId,
    posicao: gatilho.posicao,
    raio: gatilho.raio,
  }
}
