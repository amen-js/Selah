import { describe, expect, it } from 'vitest'
import {
  atualizarRearmePortal,
  cooldownPortalAtivo,
  criarEstadoCooldownPortal,
  iniciarCooldownPortal,
  podeAcionarPortalComCooldown,
} from './cooldown'
import type { PortalMapa } from './types'

const portal: PortalMapa = {
  id: 'portal-teste',
  destino: 'criacao',
  posicao: [0, 0, 0],
  raioAtivacao: 2,
}

describe('cooldown e rearme de portal', () => {
  it('começa armado e permite acionamento sem cooldown', () => {
    const estado = criarEstadoCooldownPortal()

    expect(podeAcionarPortalComCooldown(estado, 0)).toBe(true)
  })

  it('bloqueia até o relógio injetado expirar', () => {
    const estado = iniciarCooldownPortal(criarEstadoCooldownPortal(), 1000, 500)

    expect(cooldownPortalAtivo(estado, 1499)).toBe(true)
    expect(podeAcionarPortalComCooldown(estado, 1499)).toBe(false)
    expect(cooldownPortalAtivo(estado, 1500)).toBe(false)
    expect(podeAcionarPortalComCooldown(estado, 1500)).toBe(false)
  })

  it('não rearma dentro do raio acrescido da margem', () => {
    const estado = iniciarCooldownPortal(criarEstadoCooldownPortal(), 0, 0)

    expect(atualizarRearmePortal(estado, { x: 2.5, z: 0 }, portal)).toBe(estado)
    expect(podeAcionarPortalComCooldown(estado, 1)).toBe(false)
  })

  it('rearma somente depois de sair da margem e então permite nova entrada', () => {
    const estado = iniciarCooldownPortal(criarEstadoCooldownPortal(), 10, 100)
    const rearmado = atualizarRearmePortal(estado, { x: 2.76, z: 0 }, portal)

    expect(rearmado.armado).toBe(true)
    expect(podeAcionarPortalComCooldown(rearmado, 109)).toBe(false)
    expect(podeAcionarPortalComCooldown(rearmado, 110)).toBe(true)
  })

  it('não muta o estado nem permite raio/margem negativos ampliarem a área', () => {
    const estado = iniciarCooldownPortal(criarEstadoCooldownPortal(), 0, 10)
    const rearmado = atualizarRearmePortal(
      estado,
      { x: 0, z: 0 },
      { ...portal, raioAtivacao: -2 },
      -1,
    )

    expect(rearmado).toBe(estado)
    expect(estado.armado).toBe(false)
  })
})
