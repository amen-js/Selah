import type { Regiao } from '../types/selah'
import { mapaCriacao } from './criacao'
import { mapaHub } from './hub'
import { mapaNoe } from './noe'
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
 * Joseph remains an explicit placeholder until its future map is approved.
 * Adding that map only requires replacing its `mapa` and flag.
 */
export const catalogoRegioes = {
  hub: {
    id: 'hub',
    tipo: 'hub',
    disponivel: true,
    mapa: mapaHub,
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
    disponivel: true,
    mapa: mapaNoe,
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
