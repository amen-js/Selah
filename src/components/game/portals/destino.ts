import { obterDefinicaoRegiao } from '../../../mapas/regioes'
import type { Regiao } from '../../../types/selah'
import { portalDisponivel } from './proximidade'
import type { PortalMapa } from './types'

/** Resolve somente destinos que possuem mapa jogável registrado. */
export function resolverDestinoPortal(portal: PortalMapa): Regiao | null {
  if (!portalDisponivel(portal)) return null

  const destino = obterDefinicaoRegiao(portal.destino)
  if (!destino.disponivel || !destino.mapa) return null

  return destino.id
}
