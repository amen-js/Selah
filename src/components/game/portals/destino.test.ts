import { describe, expect, it } from 'vitest'
import { resolverDestinoPortal } from './destino'
import type { PortalMapa } from './types'

const criarPortal = (
  destino: PortalMapa['destino'],
  disponivel = true,
): PortalMapa => ({
  id: `portal-${destino}`,
  destino,
  posicao: [0, 0, 0],
  raioAtivacao: 1.5,
  disponivel,
})

describe('destino de portal', () => {
  it.each(['hub', 'criacao', 'noe'] as const)(
    'resolve a região jogável %s',
    (regiao) => {
      expect(resolverDestinoPortal(criarPortal(regiao))).toBe(regiao)
    },
  )

  it('bloqueia portal explicitamente indisponível', () => {
    expect(resolverDestinoPortal(criarPortal('criacao', false))).toBeNull()
  })

  it('bloqueia região sem mapa jogável', () => {
    expect(resolverDestinoPortal(criarPortal('jose'))).toBeNull()
  })
})
