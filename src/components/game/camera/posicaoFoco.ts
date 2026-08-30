import { Vector3 } from 'three'
import type { Ponto3D } from '../../../mapas/types'

const DISTANCIA_HORIZONTAL_MINIMA = 1e-8

/**
 * Retorna o lado horizontal da câmera em relação a um alvo.
 *
 * O fallback usa a mesma convenção de yaw do chase camera
 * (x = sin(yaw), z = cos(yaw)), garantindo uma direção determinística
 * quando a câmera está exatamente sobre o alvo no plano XZ.
 */
export function calcularDirecaoLateral(
  cameraPosition: Pick<Vector3, 'x' | 'z'>,
  alvo: Ponto3D,
  fallbackYaw: number,
  output: Vector3,
): Vector3 {
  const deltaX = cameraPosition.x - alvo[0]
  const deltaZ = cameraPosition.z - alvo[2]
  const comprimento = Math.hypot(deltaX, deltaZ)

  if (comprimento < DISTANCIA_HORIZONTAL_MINIMA) {
    output.set(Math.sin(fallbackYaw), 0, Math.cos(fallbackYaw))
    return output
  }

  output.set(deltaX / comprimento, 0, deltaZ / comprimento)
  return output
}

/**
 * Calcula a posição cinematográfica mantendo o lado atual da câmera.
 * O vetor `lado` deve ser horizontal e normalizado; o retorno reutiliza
 * `output` para evitar alocações no loop de renderização.
 */
export function calcularPosicaoFoco(
  lado: Pick<Vector3, 'x' | 'z'>,
  alvo: Ponto3D,
  distancia: number,
  elevacao: number,
  output: Vector3,
): Vector3 {
  output.set(
    alvo[0] + lado.x * distancia,
    alvo[1] + elevacao,
    alvo[2] + lado.z * distancia,
  )
  return output
}
