import { Object3D } from 'three'
import { describe, expect, it } from 'vitest'
import { clonarPecaModelo } from './clonarPecaModelo'

describe('clonar peça nomeada de um modelo', () => {
  it('encontra a peça, zera somente a posição local e preserva rotação e escala', () => {
    const scene = new Object3D()
    const peca = new Object3D()
    peca.name = 'Tree_01'
    peca.position.set(2, 3, 4)
    peca.rotation.set(0.2, 0.4, 0.6)
    peca.scale.set(1.5, 2, 0.75)
    scene.add(peca)

    const clone = clonarPecaModelo(scene, 'Tree_01')

    expect(clone).not.toBeNull()
    expect(clone).not.toBe(peca)
    expect(clone?.position.toArray()).toEqual([0, 0, 0])
    expect(clone?.rotation.x).toBeCloseTo(peca.rotation.x)
    expect(clone?.rotation.y).toBeCloseTo(peca.rotation.y)
    expect(clone?.rotation.z).toBeCloseTo(peca.rotation.z)
    expect(clone?.rotation.order).toBe(peca.rotation.order)
    expect(clone?.scale.toArray()).toEqual(peca.scale.toArray())
  })

  it('retorna null quando a peça não existe', () => {
    const scene = new Object3D()

    expect(clonarPecaModelo(scene, 'Missing')).toBeNull()
  })

  it('não altera a peça ou a cena original', () => {
    const scene = new Object3D()
    const peca = new Object3D()
    peca.name = 'Rock_01'
    peca.position.set(5, 6, 7)
    scene.add(peca)
    const posicaoOriginal = peca.position.clone()

    const clone = clonarPecaModelo(scene, 'Rock_01')
    clone?.position.set(9, 9, 9)

    expect(peca.position.equals(posicaoOriginal)).toBe(true)
    expect(scene.getObjectByName('Rock_01')).toBe(peca)
  })
})
