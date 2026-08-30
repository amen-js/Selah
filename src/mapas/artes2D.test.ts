import { mapaCriacao } from './criacao'
import { mapaHub } from './hub'
import type { Arte2DMapa } from './types'

const artes: readonly Arte2DMapa[] = [
  ...(mapaHub.artes2D ?? []),
  ...(mapaCriacao.artes2D ?? []),
]

const arquivosEsperados = new Set([
  '/art/creation/light/divine-light-core.svg',
  '/art/creation/light/first-glow.svg',
  '/art/creation/light/illuminated-rocks.svg',
  '/art/creation/light/light-particles.svg',
  '/art/creation/light/light-path-unlocked.svg',
  '/art/creation/light/light-portal.svg',
  '/art/animals/kenney/duck.png',
  '/art/animals/kenney/elephant.png',
  '/art/animals/kenney/giraffe.png',
  '/art/animals/kenney/rabbit.png',
])

describe('arte 2.5D dos mapas', () => {
  it('usa IDs únicos e somente os arquivos importados para este slice', () => {
    const ids = artes.map(({ id }) => id)

    expect(new Set(ids).size).toBe(ids.length)
    for (const arte of artes) {
      expect(arte.arquivo.startsWith('/art/')).toBe(true)
      expect(arquivosEsperados.has(arte.arquivo)).toBe(true)
    }
    expect(new Set(artes.map(({ arquivo }) => arquivo))).toEqual(arquivosEsperados)
  })

  it('mantém escalas e opacidades válidas', () => {
    for (const arte of artes) {
      expect(arte.escala[0]).toBeGreaterThan(0)
      expect(arte.escala[1]).toBeGreaterThan(0)
      expect(arte.opacidade ?? 1).toBeGreaterThan(0)
      expect(arte.opacidade ?? 1).toBeLessThanOrEqual(1)
    }
  })

  it('usa arte somente como decoração sem substituir colecionáveis', () => {
    expect(mapaHub.artes2D).toHaveLength(1)
    expect(mapaHub.coletaveis).toHaveLength(0)
    expect(mapaCriacao.artes2D).toHaveLength(9)
    expect(mapaCriacao.coletaveis).toHaveLength(5)
  })
})
