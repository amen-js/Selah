import type { ColetavelMapa } from '../../../mapas/types'
import { podeAcionarColetavel } from '../creation/podeAcionarColetavel'
import {
  distancia3D,
  estaNoRaio,
  type PosicaoJogador,
} from '../creation/proximidade'

export const RAIO_ATIVACAO_PADRAO = 2.5

export interface EstadoSelecaoColetavel {
  enabled: boolean
  selahAtivo: boolean
  pausaParentalAtiva: boolean
  selahsConcluidos: readonly string[]
  coletaveisAcionados: ReadonlySet<string>
}

/** Selects exactly one eligible collectible, preferring the nearest one. */
export function selecionarColetavelAcionavel(
  coletaveis: readonly ColetavelMapa[],
  posicaoJogador: PosicaoJogador | null,
  estado: EstadoSelecaoColetavel,
): ColetavelMapa | null {
  if (!posicaoJogador) return null

  const concluidos = new Set(estado.selahsConcluidos)
  let selecionado: ColetavelMapa | null = null
  let menorDistancia = Number.POSITIVE_INFINITY

  for (const coletavel of coletaveis) {
    const distancia = distancia3D(posicaoJogador, {
      x: coletavel.posicao[0],
      y: coletavel.posicao[1],
      z: coletavel.posicao[2],
    })
    const raio = coletavel.raioAtivacao ?? RAIO_ATIVACAO_PADRAO

    if (distancia > raio) continue
    if (
      !podeAcionarColetavel({
        enabled: estado.enabled,
        jaAcionado: estado.coletaveisAcionados.has(coletavel.id),
        selahAtivo: estado.selahAtivo,
        pausaParentalAtiva: estado.pausaParentalAtiva,
        passagemRespondida: concluidos.has(coletavel.passagemId),
      })
    ) {
      continue
    }

    if (distancia < menorDistancia) {
      selecionado = coletavel
      menorDistancia = distancia
    }
  }

  return selecionado
}

/**
 * Keeps unanswered collectibles latched while the player remains in range.
 * A completed Selah is permanently blocked; an unanswered attempt rearms only
 * after a real exit from its activation radius.
 */
export function obterColetaveisAindaAcionados(
  coletaveis: readonly ColetavelMapa[],
  posicaoJogador: PosicaoJogador | null,
  coletaveisAcionados: ReadonlySet<string>,
  selahsConcluidos: readonly string[],
): Set<string> {
  const porId = new Map(coletaveis.map((coletavel) => [coletavel.id, coletavel]))
  const concluidos = new Set(selahsConcluidos)
  const aindaAcionados = new Set<string>()

  for (const id of coletaveisAcionados) {
    const coletavel = porId.get(id)
    if (!coletavel) continue

    if (concluidos.has(coletavel.passagemId)) {
      aindaAcionados.add(id)
      continue
    }

    if (
      !posicaoJogador ||
      estaNoRaio(
        posicaoJogador,
        coletavel.posicao,
        coletavel.raioAtivacao ?? RAIO_ATIVACAO_PADRAO,
      )
    ) {
      aindaAcionados.add(id)
    }
  }

  return aindaAcionados
}
