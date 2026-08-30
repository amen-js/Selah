import { useSpring } from '@react-spring/three'
import { useFrame, useThree } from '@react-three/fiber'
import type { EcctrlHandle } from 'ecctrl'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { Vector3 } from 'three'
import { calcularDirecaoLateral, calcularPosicaoFoco } from './posicaoFoco'
import type { FocoCameraSelah } from './types'
import {
  consumirArrastoCameraMobile,
  type EstadoControleMobile,
} from '../mobile/mobileInput'

const YAW_INICIAL = 0.7
const PITCH_INICIAL = 0.32
const DISTANCIA_INICIAL = 9.5
const PROGRESSO_EPSILON = 0.0001
const SENSIBILIDADE_CAMERA_MOBILE = 0.004

export interface SelahCameraRigProps {
  controller: RefObject<EcctrlHandle | null>
  controleMobile: EstadoControleMobile
  foco: FocoCameraSelah | null
  manterFoco: boolean
}

/**
 * Camera de exploração com transição suave para o enquadramento de um
 * Momento Selah. O componente não depende do store para poder ser usado em
 * qualquer cena que forneça um EcctrlHandle e um foco cinematográfico.
 */
export function SelahCameraRig({
  controller,
  controleMobile,
  foco,
  manterFoco,
}: SelahCameraRigProps) {
  const { camera, gl } = useThree()
  const desiredTarget = useMemo(() => new Vector3(), [])
  const smoothedTarget = useMemo(() => new Vector3(), [])
  const desiredCameraPosition = useMemo(() => new Vector3(), [])
  const cinematicPosition = useMemo(() => new Vector3(), [])
  const cinematicTarget = useMemo(() => new Vector3(), [])
  const blendedTarget = useMemo(() => new Vector3(), [])
  const focoLateral = useMemo(() => new Vector3(), [])
  const yaw = useRef(YAW_INICIAL)
  const pitch = useRef(PITCH_INICIAL)
  const distance = useRef(DISTANCIA_INICIAL)
  const initialized = useRef(false)
  const focoAnterior = useRef<FocoCameraSelah | null>(null)
  const manterFocoAtual = useRef(false)
  const ultimoFoco = useRef<FocoCameraSelah | null>(null)

  const [{ progressoFoco }, spring] = useSpring(() => ({
    progressoFoco: 0,
    config: { tension: 170, friction: 26, precision: 0.0001 },
  }))

  useEffect(() => {
    if (foco) ultimoFoco.current = foco

    const proximoFoco = foco ?? (manterFoco ? ultimoFoco.current : null)
    const focoEstavaAtivo = manterFocoAtual.current
    const focoAnteriorId = focoAnterior.current?.id

    manterFocoAtual.current = proximoFoco !== null

    if (proximoFoco) {
      if (!focoEstavaAtivo || focoAnteriorId !== proximoFoco.id) {
        calcularDirecaoLateral(
          camera.position,
          proximoFoco.alvo,
          yaw.current,
          focoLateral,
        )
      }
      focoAnterior.current = proximoFoco
    }

    spring.start({ progressoFoco: proximoFoco ? 1 : 0 })
  }, [camera, foco, focoLateral, manterFoco, spring])

  useEffect(() => {
    const canvas = gl.domElement
    const handleMouseMove = (event: MouseEvent) => {
      if (
        manterFocoAtual.current ||
        document.pointerLockElement !== canvas
      ) {
        return
      }

      yaw.current -= event.movementX * 0.0025
      pitch.current = Math.min(
        1.35,
        Math.max(0.15, pitch.current + event.movementY * 0.0025),
      )
    }

    const handleWheel = (event: WheelEvent) => {
      if (
        manterFocoAtual.current ||
        document.pointerLockElement !== canvas
      ) {
        return
      }

      event.preventDefault()
      distance.current = Math.min(
        18,
        Math.max(2.5, distance.current + event.deltaY * 0.01),
      )
    }

    const preventContextMenu = (event: MouseEvent) => event.preventDefault()

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('contextmenu', preventContextMenu)
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('contextmenu', preventContextMenu)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [gl])

  useFrame(({ camera: frameCamera }, delta) => {
    const arrastoMobile = consumirArrastoCameraMobile(controleMobile)
    if (!manterFocoAtual.current) {
      yaw.current -= arrastoMobile.x * SENSIBILIDADE_CAMERA_MOBILE
      pitch.current = Math.min(
        1.35,
        Math.max(
          0.15,
          pitch.current + arrastoMobile.y * SENSIBILIDADE_CAMERA_MOBILE,
        ),
      )
    }

    const character = controller.current
    if (!character) return

    const position = character.currPos
    desiredTarget.set(position.x, position.y + 0.2, position.z)

    if (initialized.current) {
      smoothedTarget.lerp(desiredTarget, 1 - Math.exp(-14 * delta))
    } else {
      smoothedTarget.copy(desiredTarget)
      initialized.current = true
    }

    const horizontalDistance = Math.cos(pitch.current) * distance.current
    desiredCameraPosition.set(
      smoothedTarget.x + Math.sin(yaw.current) * horizontalDistance,
      smoothedTarget.y + Math.sin(pitch.current) * distance.current,
      smoothedTarget.z + Math.cos(yaw.current) * horizontalDistance,
    )

    const progresso = progressoFoco.get()
    const focoEmTransicao = focoAnterior.current
    if (focoEmTransicao && progresso > PROGRESSO_EPSILON) {
      cinematicTarget.set(
        focoEmTransicao.alvo[0],
        focoEmTransicao.alvo[1],
        focoEmTransicao.alvo[2],
      )
      calcularPosicaoFoco(
        focoLateral,
        focoEmTransicao.alvo,
        focoEmTransicao.distancia,
        focoEmTransicao.elevacao,
        cinematicPosition,
      )
      desiredCameraPosition.lerp(cinematicPosition, progresso)
      blendedTarget.lerpVectors(smoothedTarget, cinematicTarget, progresso)
    } else {
      blendedTarget.copy(smoothedTarget)
    }

    frameCamera.position.lerp(
      desiredCameraPosition,
      1 - Math.exp(-22 * delta),
    )
    frameCamera.lookAt(blendedTarget)
  })

  return null
}
