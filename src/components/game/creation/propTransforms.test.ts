import { describe, expect, it } from 'vitest'
import type { PropMapa } from '../../../mapas/types'
import { normalizarEscala, obterTransformacaoProp } from './propTransforms'

describe('transformações de props', () => {
  it('expande escala uniforme e fornece unidade por padrão', () => {
    expect(normalizarEscala()).toEqual([1, 1, 1])
    expect(normalizarEscala(2.5)).toEqual([2.5, 2.5, 2.5])
  })

  it('copia escala vetorial sem alterar o array readonly do mapa', () => {
    const escala = [1, 2, 3] as const
    const normalizada = normalizarEscala(escala)

    expect(normalizada).toEqual([1, 2, 3])
    expect(normalizada).not.toBe(escala)
  })

  it('aplica rotação somente no eixo Y e preserva posição', () => {
    const prop: Pick<PropMapa, 'posicao' | 'rotacao' | 'escala'> = {
      posicao: [4, 0.5, -2],
      rotacao: Math.PI / 2,
      escala: 0.75,
    }

    expect(obterTransformacaoProp(prop)).toEqual({
      position: [4, 0.5, -2],
      rotation: [0, Math.PI / 2, 0],
      scale: [0.75, 0.75, 0.75],
    })
  })
})

