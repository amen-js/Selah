import { BufferGeometry, Float32BufferAttribute, Group, Mesh } from 'three'
import { describe, expect, it, vi } from 'vitest'
import { liberarCenario3D, prepararCenario3D } from './prepararCenario3D'

function criarCenaSemNormais() {
  const geometry = new BufferGeometry()
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute([
      0, 0, 0,
      1, 0, 0,
      0, 1, 0,
    ], 3),
  )
  const scene = new Group()
  scene.add(new Mesh(geometry))
  return { geometry, scene }
}

describe('preparação de cenário 3D completo', () => {
  it('clona geometria e calcula normais sem mutar o GLB em cache', () => {
    const { geometry, scene } = criarCenaSemNormais()

    const clone = prepararCenario3D(scene)
    const meshClone = clone.children[0] as Mesh

    expect(clone).not.toBe(scene)
    expect(meshClone.geometry).not.toBe(geometry)
    expect(meshClone.geometry.getAttribute('normal')).toBeDefined()
    expect(geometry.getAttribute('normal')).toBeUndefined()
    expect(meshClone.castShadow).toBe(true)
    expect(meshClone.receiveShadow).toBe(true)
  })

  it('libera as geometrias pertencentes ao clone', () => {
    const clone = prepararCenario3D(criarCenaSemNormais().scene)
    const meshClone = clone.children[0] as Mesh
    const dispose = vi.spyOn(meshClone.geometry, 'dispose')

    liberarCenario3D(clone)

    expect(dispose).toHaveBeenCalledOnce()
  })
})
