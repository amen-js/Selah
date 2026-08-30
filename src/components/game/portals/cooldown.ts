import { estaNoRaioXZ } from './proximidade'
import type { PortalMapa, PosicaoXZ } from './types'

/** Tempo mínimo para impedir uma segunda transição acidental. */
export const DURACAO_COOLDOWN_PORTAL_MS = 1200

/** Distância adicional que o jogador precisa percorrer para rearmar. */
export const MARGEM_REARME_PORTAL = 0.75

export type EstadoCooldownPortal = Readonly<{
  cooldownAte: number
  armado: boolean
}>

export const ESTADO_COOLDOWN_PORTAL_INICIAL: EstadoCooldownPortal = {
  cooldownAte: 0,
  armado: true,
}

export function criarEstadoCooldownPortal(): EstadoCooldownPortal {
  return { ...ESTADO_COOLDOWN_PORTAL_INICIAL }
}

/** Inicia cooldown e desarma o portal até o jogador sair da área ampliada. */
export function iniciarCooldownPortal(
  estado: EstadoCooldownPortal,
  agora: number,
  duracaoMs = DURACAO_COOLDOWN_PORTAL_MS,
): EstadoCooldownPortal {
  const duracaoSegura = Math.max(0, duracaoMs)

  return {
    cooldownAte: Math.max(estado.cooldownAte, agora + duracaoSegura),
    armado: false,
  }
}

/** Rearma apenas fora do raio de ativação acrescido da margem de segurança. */
export function atualizarRearmePortal(
  estado: EstadoCooldownPortal,
  jogador: PosicaoXZ,
  portal: Pick<PortalMapa, 'posicao' | 'raioAtivacao'>,
  margem = MARGEM_REARME_PORTAL,
): EstadoCooldownPortal {
  if (estado.armado) return estado

  const margemSegura = Math.max(0, margem)
  const raioRearme = Math.max(0, portal.raioAtivacao) + margemSegura
  if (estaNoRaioXZ(jogador, portal.posicao, raioRearme)) return estado

  return { ...estado, armado: true }
}

export function cooldownPortalAtivo(
  estado: EstadoCooldownPortal,
  agora: number,
): boolean {
  return agora < estado.cooldownAte
}

/** Guarda final para permitir uma nova confirmação de entrada. */
export function podeAcionarPortalComCooldown(
  estado: EstadoCooldownPortal,
  agora: number,
): boolean {
  return estado.armado && !cooldownPortalAtivo(estado, agora)
}
