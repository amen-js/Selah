import { describe, expect, it } from 'vitest'
import {
  distanciaXZ,
  estaNoRaioXZ,
  portalDisponivel,
  resolverPortalProximo,
} from './proximidade'
import type { PortalMapa } from './types'

const portalLeste: PortalMapa = {
  id: 'portal-leste',
  destino: 'criacao',
  posicao: [4, 0, 0],
  raioAtivacao: 3,
}

const portalOeste: PortalMapa = {
  id: 'portal-oeste',
  destino: 'hub',
  posicao: [-2, 10, 0],
  raioAtivacao: 3,
}

describe('helpers de proximidade de portais', () => {
  it('mede somente XZ, mesmo com alturas diferentes', () => {
    expect(distanciaXZ({ x: 0, z: 0 }, [3, 100, 4])).toBe(5)
    expect(estaNoRaioXZ({ x: 3, z: 4 }, [0, -40, 0], 5)).toBe(true)
  })

  it('inclui o limite do raio e rejeita distância maior', () => {
    expect(estaNoRaioXZ([1, 50, 0], portalLeste.posicao, 3)).toBe(true)
    expect(estaNoRaioXZ([0.99, 50, 0], portalLeste.posicao, 3)).toBe(false)
  })

  it('seleciona o portal disponível mais próximo sem mutar array readonly', () => {
    const portais: readonly PortalMapa[] = [portalLeste, portalOeste]

    expect(resolverPortalProximo({ x: 3, z: 0 }, portais)).toBe(portalLeste)
    expect(portais).toEqual([portalLeste, portalOeste])
  })

  it('desempata por prioridade e depois por ID, não pela ordem de entrada', () => {
    const primeiro: PortalMapa = {
      id: 'portal-z',
      destino: 'hub',
      posicao: [0, 0, 0],
      raioAtivacao: 2,
      prioridade: 2,
    }
    const segundo: PortalMapa = {
      id: 'portal-a',
      destino: 'criacao',
      posicao: [0, 9, 0],
      raioAtivacao: 2,
      prioridade: 1,
    }

    expect(resolverPortalProximo([0, 0, 0], [primeiro, segundo])).toBe(segundo)
    expect(resolverPortalProximo([0, 0, 0], [segundo, primeiro])).toBe(segundo)

    const mesmoNivel = { ...segundo, prioridade: 2 }
    expect(resolverPortalProximo([0, 0, 0], [primeiro, mesmoNivel])).toBe(mesmoNivel)
  })

  it('retorna null fora do raio ou para portal indisponível', () => {
    const indisponivel = { ...portalLeste, disponivel: false }

    expect(portalDisponivel(portalLeste)).toBe(true)
    expect(portalDisponivel(indisponivel)).toBe(false)
    expect(resolverPortalProximo({ x: 0, z: 0 }, [indisponivel])).toBeNull()
    expect(resolverPortalProximo({ x: 100, z: 100 }, [portalLeste])).toBeNull()
  })
})
