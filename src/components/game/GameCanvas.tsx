import {
  KeyboardControls,
  useKeyboardControls,
  type KeyboardControlsEntry,
} from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  CuboidCollider,
  Physics,
  RigidBody,
} from '@react-three/rapier'
import { Ecctrl, type EcctrlHandle } from 'ecctrl'
import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react'
import { Color } from 'three'
import { mapaCriacao } from '../../mapas/criacao'
import { useGameStore } from '../../stores/gameStore'
import { SelahCameraRig } from './camera/SelahCameraRig'
import { resolverFocoCameraSelah } from './camera/selahFocus'
import type { FocoCameraSelah } from './camera/types'
import {
  ColetaveisCriacao,
  PropMapaRenderer,
  type PosicaoJogador,
} from './creation'

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

type PlayerProps = {
  playing: boolean
  posicaoJogadorRef: RefObject<PosicaoJogador | null>
  focoCamera: FocoCameraSelah | null
  manterFoco: boolean
}

function Player({
  playing,
  posicaoJogadorRef,
  focoCamera,
  manterFoco,
}: PlayerProps) {
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
    const character = controller.current
    if (!character) return

    posicaoJogadorRef.current = character.currPos
    if (playing) character.setMovement(getControls())
  }, -1)

  return (
    <>
      <Ecctrl
        ref={controller}
        enable={playing}
        position={[
          mapaCriacao.spawn[0],
          mapaCriacao.spawn[1],
          mapaCriacao.spawn[2],
        ]}
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
      <SelahCameraRig
        controller={controller}
        foco={focoCamera}
        manterFoco={manterFoco}
      />
    </>
  )
}

function World({ playing }: { playing: boolean }) {
  const posicaoJogadorRef = useRef<PosicaoJogador | null>(null)
  const setRegiao = useGameStore((state) => state.setRegiao)
  const gatilhoSelah = useGameStore((state) => state.selahAtivo?.gatilho ?? null)
  const pausaParentalAtiva = useGameStore((state) => state.pausaParentalAtiva)
  const { meiaLargura, meiaProfundidade } = mapaCriacao.limites
  const focoCamera = useMemo(
    () => resolverFocoCameraSelah(gatilhoSelah, mapaCriacao.coletaveis),
    [gatilhoSelah],
  )

  useEffect(() => {
    setRegiao('criacao')
  }, [setRegiao])

  return (
    <>
      <color attach="background" args={['#b8d7ca']} />
      <fog attach="fog" args={['#b8d7ca', 16, 36]} />

      <hemisphereLight args={['#fff1c7', '#365c48', 2.2]} />
      <directionalLight position={[8, 12, 5]} intensity={2.5} color="#fff4d6" />

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[meiaLargura, 0.25, meiaProfundidade]}
          position={[0, -0.25, 0]}
          friction={1}
        />
        <mesh position={[0, -0.25, 0]} receiveShadow>
          <boxGeometry args={[meiaLargura * 2, 0.5, meiaProfundidade * 2]} />
          <meshStandardMaterial color="#6f9369" roughness={1} />
        </mesh>
      </RigidBody>

      <PropMapaRenderer props={mapaCriacao.props} />
      <ColetaveisCriacao
        coletaveis={mapaCriacao.coletaveis}
        posicaoJogadorRef={posicaoJogadorRef}
        enabled={playing}
      />

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[meiaLargura, 1, 0.25]}
          position={[0, 0.75, -meiaProfundidade]}
        />
        <CuboidCollider
          args={[meiaLargura, 1, 0.25]}
          position={[0, 0.75, meiaProfundidade]}
        />
        <CuboidCollider
          args={[0.25, 1, meiaProfundidade]}
          position={[-meiaLargura, 0.75, 0]}
        />
        <CuboidCollider
          args={[0.25, 1, meiaProfundidade]}
          position={[meiaLargura, 0.75, 0]}
        />
      </RigidBody>

      <Player
        playing={playing}
        posicaoJogadorRef={posicaoJogadorRef}
        focoCamera={focoCamera}
        manterFoco={pausaParentalAtiva}
      />
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
