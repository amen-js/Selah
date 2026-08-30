import type { Regiao } from '../types/selah'
import { mapaCriacao } from './criacao'
import type { MapaRegiao } from './types'

export type TipoRegiao = 'hub' | 'mundo'

export interface DefinicaoRegiao {
  id: Regiao
  tipo: TipoRegiao
  disponivel: boolean
  mapa: MapaRegiao | null
}

/**
 * Runtime catalogue for the scenes known by the game.
 *
 * The entries for Noah and Joseph are deliberately explicit placeholders:
 * navigation can present them as unavailable without pretending that a map
 * exists. Adding a future map only requires replacing its `mapa` and flag.
 */
export const catalogoRegioes = {
  hub: {
    id: 'hub',
    tipo: 'hub',
    disponivel: true,
    mapa: null,
  },
  criacao: {
    id: 'criacao',
    tipo: 'mundo',
    disponivel: true,
    mapa: mapaCriacao,
  },
  noe: {
    id: 'noe',
    tipo: 'mundo',
    disponivel: false,
    mapa: null,
  },
  jose: {
    id: 'jose',
    tipo: 'mundo',
    disponivel: false,
    mapa: null,
  },
} as const satisfies Record<Regiao, DefinicaoRegiao>

export function obterDefinicaoRegiao(regiao: Regiao): DefinicaoRegiao {
  return catalogoRegioes[regiao]
}

export function obterMapaRegiao(regiao: Regiao): MapaRegiao | null {
  return obterDefinicaoRegiao(regiao).mapa
}
