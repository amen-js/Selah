import { describe, expect, it } from 'vitest'

import {
  MARGEM_REARME_PORTAL,
  distanciaXZ,
  type PortalMapa,
} from '../components/game/portals'
import { portaisPorRegiao } from './portais'
import { obterMapaRegiao } from './regioes'
import type { Regiao } from '../types/selah'

const entradasPortais = Object.entries(portaisPorRegiao) as [Regiao, readonly PortalMapa[]][]

describe('configuração de portais por região', () => {
  it('define os destinos e disponibilidades da jornada', () => {
    expect(
      entradasPortais
        .flatMap(([origem, portais]) =>
          portais.map(({ id, destino, disponivel }) => ({
            id,
            origem,
            destino,
            disponivel,
          })),
        )
        .sort((a, b) => a.id.localeCompare(b.id)),
    ).toEqual([
      {
        id: 'portal-criacao-hub',
        origem: 'criacao',
        destino: 'hub',
        disponivel: true,
      },
      {
        id: 'portal-hub-criacao',
        origem: 'hub',
        destino: 'criacao',
        disponivel: true,
      },
      {
        id: 'portal-hub-jose',
        origem: 'hub',
        destino: 'jose',
        disponivel: false,
      },
      {
        id: 'portal-hub-noe',
        origem: 'hub',
        destino: 'noe',
        disponivel: true,
      },
      {
        id: 'portal-noe-hub',
        origem: 'noe',
        destino: 'hub',
        disponivel: true,
      },
    ])
  })

  it('mantém todos os portais dentro dos limites do mapa de origem', () => {
    for (const [origem, portais] of entradasPortais) {
      const mapa = obterMapaRegiao(origem)
      if (!mapa) continue

      for (const portal of portais) {
        expect(portal.posicao[0]).toBeGreaterThanOrEqual(-mapa.limites.meiaLargura)
        expect(portal.posicao[0]).toBeLessThanOrEqual(mapa.limites.meiaLargura)
        expect(portal.posicao[2]).toBeGreaterThanOrEqual(-mapa.limites.meiaProfundidade)
        expect(portal.posicao[2]).toBeLessThanOrEqual(mapa.limites.meiaProfundidade)
      }
    }
  })

  it('mantém o spawn de cada destino fora de portais e colecionáveis', () => {
    for (const [, portais] of entradasPortais) {
      for (const portal of portais) {
        const mapaDestino = obterMapaRegiao(portal.destino)
        if (!mapaDestino) continue

        const spawn = mapaDestino.spawn
        for (const portalDestino of portaisPorRegiao[portal.destino]) {
          expect(distanciaXZ(spawn, portalDestino.posicao)).toBeGreaterThan(
            portalDestino.raioAtivacao + MARGEM_REARME_PORTAL,
          )
        }
        for (const coletavel of mapaDestino.coletaveis) {
          expect(distanciaXZ(spawn, coletavel.posicao)).toBeGreaterThan(
            (coletavel.raioAtivacao ?? 0) + MARGEM_REARME_PORTAL,
          )
        }
      }
    }
  })
})
