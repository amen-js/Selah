import type { PortalMapa } from '../components/game/portals/types'
import type { Regiao } from '../types/selah'

/**
 * Portais são configuração de navegação, não parte da geometria do mapa.
 * Assim, a cena pode trocar de região sem alterar o contrato de MapaRegiao.
 */
export const portaisPorRegiao: Readonly<Record<Regiao, readonly PortalMapa[]>> = {
  hub: [
    {
      id: 'portal-hub-criacao',
      destino: 'criacao',
      posicao: [-7, 0.65, 0],
      raioAtivacao: 1.5,
      disponivel: true,
      prioridade: 10,
    },
    {
      id: 'portal-hub-noe',
      destino: 'noe',
      posicao: [0, 0.5, -7],
      raioAtivacao: 1.5,
      disponivel: true,
      prioridade: 20,
    },
    {
      id: 'portal-hub-jose',
      destino: 'jose',
      posicao: [7, 0.5, 0],
      raioAtivacao: 1.5,
      disponivel: false,
      prioridade: 30,
    },
  ],
  criacao: [
    {
      id: 'portal-criacao-hub',
      destino: 'hub',
      posicao: [-20, 0.8, -18],
      raioAtivacao: 1.5,
      disponivel: true,
    },
  ],
  noe: [
    {
      id: 'portal-noe-hub',
      destino: 'hub',
      posicao: [40, 0, 38],
      raioAtivacao: 1.5,
      disponivel: true,
    },
  ],
  jose: [],
}

export default portaisPorRegiao
