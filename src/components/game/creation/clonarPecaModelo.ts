import type { Object3D } from 'three'

/**
 * Clones one named object from a loaded model without changing the source
 * scene. The clone keeps the asset's rotation and scale, but starts at the
 * local origin of the map prop.
 */
export function clonarPecaModelo(scene: Object3D, nome: string): Object3D | null {
  const peca = scene.getObjectByName(nome)
  if (!peca) return null

  const clone = peca.clone(true)
  clone.position.set(0, 0, 0)
  return clone
}
