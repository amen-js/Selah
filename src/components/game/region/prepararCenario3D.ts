import { Mesh, type Object3D } from 'three'

/**
 * Creates a scene-owned clone and calculates normals missing from legacy GLBs.
 * Geometry is cloned before modification so the useGLTF cache remains intact.
 */
export function prepararCenario3D(scene: Object3D): Object3D {
  const clone = scene.clone(true)

  clone.traverse((object) => {
    if (!(object instanceof Mesh)) return

    object.geometry = object.geometry.clone()
    if (!object.geometry.getAttribute('normal')) {
      object.geometry.computeVertexNormals()
    }
    object.castShadow = true
    object.receiveShadow = true
  })

  return clone
}

/** Releases only the geometries cloned by prepararCenario3D. */
export function liberarCenario3D(scene: Object3D): void {
  scene.traverse((object) => {
    if (object instanceof Mesh) object.geometry.dispose()
  })
}
