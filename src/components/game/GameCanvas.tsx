import {
  KeyboardControls,
  useKeyboardControls,
  type KeyboardControlsEntry,
} from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  CuboidCollider,
  Physics,
  RigidBody,
} from '@react-three/rapier'
import { Ecctrl, type EcctrlHandle } from 'ecctrl'
import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react'
import { Color, Vector3 } from 'three'

type GameControl =
  | 'forward'
  | 'backward'
  | 'leftward'
  | 'rightward'
  | 'jump'
  | 'run'

const keyboardMap: KeyboardControlsEntry<GameControl>[] = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'run', keys: ['ShiftLeft', 'ShiftRight'] },
]

function CameraRig({ controller }: { controller: RefObject<EcctrlHandle | null> }) {
  const { gl } = useThree()
  const desiredTarget = useMemo(() => new Vector3(), [])
  const smoothedTarget = useMemo(() => new Vector3(), [])
  const desiredCameraPosition = useMemo(() => new Vector3(), [])
  const yaw = useRef(0.7)
  const pitch = useRef(0.32)
  const distance = useRef(9.5)
  const initialized = useRef(false)

  useEffect(() => {
    const canvas = gl.domElement
    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return

      yaw.current -= event.movementX * 0.0025
      pitch.current = Math.min(
        1.35,
        Math.max(0.15, pitch.current + event.movementY * 0.0025),
      )
    }

    const handleWheel = (event: WheelEvent) => {
      if (document.pointerLockElement !== canvas) return

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

  useFrame(({ camera }, delta) => {
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

    camera.position.lerp(desiredCameraPosition, 1 - Math.exp(-22 * delta))
    camera.lookAt(smoothedTarget)
  })

  return null
}

function Player({ playing }: { playing: boolean }) {
  const controller = useRef<EcctrlHandle>(null)
  const [, getControls] = useKeyboardControls<GameControl>()

  useEffect(() => {
    const character = controller.current

    character?.setLockForward(playing)

    if (!playing && character) {
      character.setMovement({
        forward: false,
        backward: false,
        leftward: false,
        rightward: false,
        jump: false,
        run: false,
      })
      character.body.setLinvel(
        { x: 0, y: character.currLinVel.y, z: 0 },
        true,
      )
    }
  }, [playing])

  useFrame(() => {
    if (playing) controller.current?.setMovement(getControls())
  }, -1)

  return (
    <>
      <Ecctrl
        ref={controller}
        enable={playing}
        position={[0, 2, 2]}
        capsuleHalfHeight={0.28}
        capsuleRadius={0.3}
        floatHeight={0.15}
        rayHitForgiveness={0.18}
        springK={80}
        dampingC={10}
        maxWalkVel={4}
        maxRunVel={7}
        accDeltaTime={0.24}
        decDeltaTime={0.32}
        rejectVelFactor={1}
        slideGripFactor={0.8}
        jumpVel={5.5}
        ccd
        friction={0}
        enabledRotations={[false, true, false]}
        autoBalance={false}
        enableToggleRun={false}
      >
        <group position={[0, -0.15, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.72, 1.12, 0.72]} />
            <meshStandardMaterial color="#e9b949" roughness={0.72} />
          </mesh>
          <mesh position={[0, 0.1, -0.37]}>
            <boxGeometry args={[0.36, 0.12, 0.04]} />
            <meshStandardMaterial color="#fff3c4" />
          </mesh>
        </group>
      </Ecctrl>
      <CameraRig controller={controller} />
    </>
  )
}

type LandmarkProps = {
  position: [number, number, number]
  scale?: [number, number, number]
  color: string
}

function Landmark({ position, scale = [1, 1, 1], color }: LandmarkProps) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      <mesh scale={scale} castShadow receiveShadow>
        <boxGeometry />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </RigidBody>
  )
}

function World({ playing }: { playing: boolean }) {
  return (
    <>
      <color attach="background" args={['#b8d7ca']} />
      <fog attach="fog" args={['#b8d7ca', 16, 36]} />

      <hemisphereLight args={['#fff1c7', '#365c48', 2.2]} />
      <directionalLight position={[8, 12, 5]} intensity={2.5} color="#fff4d6" />

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[16, 0.25, 16]}
          position={[0, -0.25, 0]}
          friction={1}
        />
        <mesh position={[0, -0.25, 0]} receiveShadow>
          <boxGeometry args={[32, 0.5, 32]} />
          <meshStandardMaterial color="#6f9369" roughness={1} />
        </mesh>
      </RigidBody>

      <Landmark position={[-4, 0.6, -2]} scale={[2.4, 1.2, 1.2]} color="#70805d" />
      <Landmark position={[4.5, 0.4, -4]} scale={[1.3, 0.8, 2.2]} color="#8a7658" />
      <Landmark position={[1.5, 0.25, 5]} scale={[2.2, 0.5, 1]} color="#5d8261" />
      <Landmark position={[-6, 0.85, 5]} scale={[0.9, 1.7, 0.9]} color="#9b7d54" />

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[16, 1, 0.25]} position={[0, 0.75, -16]} />
        <CuboidCollider args={[16, 1, 0.25]} position={[0, 0.75, 16]} />
        <CuboidCollider args={[0.25, 1, 16]} position={[-16, 0.75, 0]} />
        <CuboidCollider args={[0.25, 1, 16]} position={[16, 0.75, 0]} />
      </RigidBody>

      <Player playing={playing} />
    </>
  )
}

function PhysicsFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.35, 16, 16]} />
      <meshBasicMaterial color="#e9b949" wireframe />
    </mesh>
  )
}

type GameCanvasProps = {
  playing: boolean
  onCanvasReady?: (canvas: HTMLCanvasElement) => void
}

export function GameCanvas({ playing, onCanvasReady }: GameCanvasProps) {
  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas
        className="game-canvas"
        camera={{ position: [6, 5, 9], fov: 70, near: 0.1, far: 80 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl, scene }) => {
          scene.background = new Color('#b8d7ca')
          onCanvasReady?.(gl.domElement)
        }}
      >
        <Suspense fallback={<PhysicsFallback />}>
          <Physics gravity={[0, -9.81, 0]}>
            <World playing={playing} />
          </Physics>
        </Suspense>
      </Canvas>
    </KeyboardControls>
  )
}
