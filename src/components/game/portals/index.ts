export {
  atualizarRearmePortal,
  cooldownPortalAtivo,
  criarEstadoCooldownPortal,
  ESTADO_COOLDOWN_PORTAL_INICIAL,
  iniciarCooldownPortal,
  podeAcionarPortalComCooldown,
  DURACAO_COOLDOWN_PORTAL_MS,
  MARGEM_REARME_PORTAL,
} from './cooldown'
export {
  distanciaXZ,
  estaNoRaioXZ,
  portalDisponivel,
  resolverPortalProximo,
  selecionarPortalProximo,
} from './proximidade'
export {
  ehTeclaConfirmacaoPortal,
  podeAcionarPortalPorTecla,
} from './teclas'
export type { EventoTeclaPortal } from './teclas'
export type { PortalMapa, PosicaoXZ } from './types'
