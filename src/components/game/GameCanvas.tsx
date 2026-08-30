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
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { Color } from 'three'
import { portaisPorRegiao } from '../../mapas/portais'
import { obterMapaRegiao } from '../../mapas/regioes'
import type { ColetavelMapa, MapaRegiao } from '../../mapas/types'
import { useGameStore } from '../../stores/gameStore'
import type { Regiao } from '../../types/selah'
import { SelahCameraRig } from './camera/SelahCameraRig'
import { resolverFocoCameraSelah } from './camera/selahFocus'
import type { FocoCameraSelah } from './camera/types'
import {
  AtmosferaCriacao,
  coletavelCriacaoDisponivelNoMomento,
  CreationInteractionPrompt,
  type EstadoProgressaoCriacao,
  EfeitosCriacao,
  Elementos3DCriacao,
  type MomentoCriacao,
  type ObjetivoZonaCriacao,
  ObjetivoNarrativoCriacao,
  obterMomentoAtualCriacao,
  obterArtesCriacaoVisiveis,
  obterPropsCriacaoVisiveis,
  ProgressaoCriacaoRuntime,
  PropMapaRenderer,
  reconstruirProgressaoCriacao,
  TerrenoCriacao,
  type TipoInteracaoCriacao,
  type PosicaoJogador,
  type SnapshotProgressaoCriacao,
} from './creation'
import {
  criarEstadoCooldownPortal,
  iniciarCooldownPortal,
  podeAcionarPortalComCooldown,
  PortaisRegiao,
  PortalPrompt,
  PortalTransitionOverlay,
  resolverDestinoPortal,
  type FasePortalTransicao,
  type PortalMapa,
} from './portals'
import { RiggedPlayer } from './player'
import { Arte2DRegiao, Cenario3DRegiao, ColetaveisRegiao } from './region'

const DURACAO_SAIDA_PORTAL_MS = 260
const DURACAO_TROCA_PORTAL_MS = 90
const DURACAO_ENTRADA_PORTAL_MS = 360

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
  spawn: MapaRegiao['spawn']
}

function Player({
  playing,
  posicaoJogadorRef,
  focoCamera,
  manterFoco,
  spawn,
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
        position={spawn}
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
        <RiggedPlayer controller={controller} />
      </Ecctrl>
      <SelahCameraRig
        controller={controller}
        foco={focoCamera}
        manterFoco={manterFoco}
      />
    </>
  )
}

type WorldProps = {
  playing: boolean
  regiao: Regiao
  mapa: MapaRegiao
  portais: readonly PortalMapa[]
  onPortalProximo: (portal: PortalMapa | null) => void
  onPortalAcionado: (portal: PortalMapa) => void
  onProgressaoCriacaoChange?: (
    snapshot: SnapshotProgressaoCriacao | null,
  ) => void
  onInteracaoCriacaoProxima: (tipo: TipoInteracaoCriacao | null) => void
}

function World({
  playing,
  regiao,
  mapa,
  portais,
  onPortalProximo,
  onPortalAcionado,
  onProgressaoCriacaoChange,
  onInteracaoCriacaoProxima,
}: WorldProps) {
  const posicaoJogadorRef = useRef<PosicaoJogador | null>(null)
  const gatilhoSelah = useGameStore((state) => state.selahAtivo?.gatilho ?? null)
  const pausaParentalAtiva = useGameStore((state) => state.pausaParentalAtiva)
  const selahsConcluidos = useGameStore((state) => state.selahsConcluidos)
  const momentosCriacaoConcluidos = useGameStore(
    (state) => state.momentosCriacaoConcluidos,
  )
  const [estadoCriacao, setEstadoCriacao] = useState<EstadoProgressaoCriacao>(
    () =>
      reconstruirProgressaoCriacao(
        selahsConcluidos,
        momentosCriacaoConcluidos,
      ),
  )
  const [interacaoCriacaoLocal, setInteracaoCriacaoLocal] =
    useState<TipoInteracaoCriacao | null>(null)
  const momentoCriacaoId = estadoCriacao.momentoAtualId
  const coletavelProximoRef = useRef<ColetavelMapa | null>(null)
  const objetivoProximoRef = useRef<ObjetivoZonaCriacao | null>(null)
  const { meiaLargura, meiaProfundidade } = mapa.limites
  const focoCamera = useMemo(
    () => resolverFocoCameraSelah(gatilhoSelah, mapa.coletaveis),
    [gatilhoSelah, mapa.coletaveis],
  )
  const coletaveisDisponiveis = useMemo(
    () =>
      regiao === 'criacao'
        ? mapa.coletaveis.filter(
            (coletavel) =>
              !selahsConcluidos.includes(coletavel.passagemId) &&
              coletavelCriacaoDisponivelNoMomento(
                coletavel.passagemId,
                momentoCriacaoId,
              ),
          )
        : mapa.coletaveis,
    [mapa.coletaveis, momentoCriacaoId, regiao, selahsConcluidos],
  )
  const propsDisponiveis = useMemo(
    () =>
      regiao === 'criacao'
        ? obterPropsCriacaoVisiveis(mapa.props, momentoCriacaoId)
        : mapa.props,
    [mapa.props, momentoCriacaoId, regiao],
  )
  const artesDisponiveis = useMemo(
    () =>
      regiao === 'criacao'
        ? obterArtesCriacaoVisiveis(
            mapa.artes2D ?? [],
            momentoCriacaoId,
          )
        : (mapa.artes2D ?? []),
    [mapa.artes2D, momentoCriacaoId, regiao],
  )
  const atualizarMomentoCriacao = useCallback(
    (_momento: MomentoCriacao, estado: EstadoProgressaoCriacao) => {
      setEstadoCriacao(estado)
    },
    [],
  )
  const publicarInteracaoCriacao = useCallback(() => {
    const tipo = coletavelProximoRef.current
      ? 'selah'
      : objetivoProximoRef.current
        ? 'ponto-criacao'
        : null
    setInteracaoCriacaoLocal(tipo)
    onInteracaoCriacaoProxima(tipo)
  }, [onInteracaoCriacaoProxima])
  const atualizarColetavelProximo = useCallback(
    (coletavel: ColetavelMapa | null) => {
      coletavelProximoRef.current = coletavel
      publicarInteracaoCriacao()
    },
    [publicarInteracaoCriacao],
  )
  const atualizarObjetivoProximo = useCallback(
    (objetivo: ObjetivoZonaCriacao | null) => {
      objetivoProximoRef.current = objetivo
      publicarInteracaoCriacao()
    },
    [publicarInteracaoCriacao],
  )

  useEffect(() => {
    if (regiao !== 'criacao') return
    onProgressaoCriacaoChange?.({
      momento: obterMomentoAtualCriacao(estadoCriacao),
      estado: estadoCriacao,
    })
  }, [estadoCriacao, onProgressaoCriacaoChange, regiao])

  useEffect(
    () => () => onInteracaoCriacaoProxima(null),
    [onInteracaoCriacaoProxima],
  )

  return (
    <>
      {regiao === 'criacao' ? (
        <AtmosferaCriacao momentoId={momentoCriacaoId} />
      ) : (
        <>
          <color attach="background" args={['#b8d7ca']} />
          <fog attach="fog" args={['#b8d7ca', 16, 36]} />
          <hemisphereLight args={['#fff1c7', '#365c48', 2.2]} />
          <directionalLight
            position={[8, 12, 5]}
            intensity={2.5}
            color="#fff4d6"
          />
        </>
      )}

      {regiao === 'criacao' ? (
        <TerrenoCriacao momentoId={momentoCriacaoId} />
      ) : mapa.chaoColisor !== false ? (
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider
            args={[meiaLargura, 0.25, meiaProfundidade]}
            position={[0, -0.25, 0]}
            friction={1}
          />
          {mapa.chaoVisivel !== false && (
            <mesh position={[0, -0.25, 0]} receiveShadow>
              <boxGeometry args={[meiaLargura * 2, 0.5, meiaProfundidade * 2]} />
              <meshStandardMaterial color="#6f9369" roughness={1} />
            </mesh>
          )}
        </RigidBody>
      ) : null}

      <Cenario3DRegiao cenario={mapa.cenario3D} />
      <PropMapaRenderer props={propsDisponiveis} />
      <Suspense fallback={null}>
        <Arte2DRegiao artes={artesDisponiveis} />
      </Suspense>
      <ColetaveisRegiao
        coletaveis={coletaveisDisponiveis}
        posicaoJogadorRef={posicaoJogadorRef}
        enabled={playing}
        interacaoExplicita={regiao === 'criacao'}
        bloquearPassagensRespondidas={regiao !== 'criacao'}
        onColetavelProximo={
          regiao === 'criacao' ? atualizarColetavelProximo : undefined
        }
      />
      {regiao === 'criacao' && (
        <>
          <EfeitosCriacao momentoId={momentoCriacaoId} />
          <Elementos3DCriacao momentoId={momentoCriacaoId} />
          <ObjetivoNarrativoCriacao
            momentoId={momentoCriacaoId}
            enabled={playing && !estadoCriacao.concluida}
            jornadaConcluida={estadoCriacao.concluida}
          />
          <ProgressaoCriacaoRuntime
            posicaoJogadorRef={posicaoJogadorRef}
            enabled={playing}
            onMomentoChange={atualizarMomentoCriacao}
            onObjetivoProximo={atualizarObjetivoProximo}
          />
        </>
      )}
      <PortaisRegiao
        portais={portais}
        playerRef={posicaoJogadorRef}
        enabled={
          playing &&
          !(regiao === 'criacao' && interacaoCriacaoLocal !== null)
        }
        onPortalProximo={onPortalProximo}
        onPortalAcionado={onPortalAcionado}
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
        spawn={mapa.spawn}
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

/** Empty scene used while a region has no map registered yet. */
function RegionFallback() {
  return <group name="region-fallback" />
}

type GameCanvasProps = {
  playing: boolean
  onCanvasReady?: (canvas: HTMLCanvasElement) => void
  onSceneReady?: () => void
  onProgressaoCriacaoChange?: (
    snapshot: SnapshotProgressaoCriacao | null,
  ) => void
}

export function GameCanvas({
  playing,
  onCanvasReady,
  onSceneReady,
  onProgressaoCriacaoChange,
}: GameCanvasProps) {
  const regiao = useGameStore((state) => state.regiao)
  const setRegiao = useGameStore((state) => state.setRegiao)
  const mapa = obterMapaRegiao(regiao)
  const [portalProximo, setPortalProximo] = useState<PortalMapa | null>(null)
  const [interacaoCriacaoProxima, setInteracaoCriacaoProxima] =
    useState<TipoInteracaoCriacao | null>(null)
  const [faseTransicao, setFaseTransicao] =
    useState<FasePortalTransicao>('inativo')
  const [destinoTransicao, setDestinoTransicao] =
    useState<PortalMapa['destino'] | null>(null)
  const transicaoAtivaRef = useRef(false)
  const cooldownPortalRef = useRef(criarEstadoCooldownPortal())
  const temporizadoresRef = useRef<number[]>([])
  const mundoAtivo = playing && faseTransicao === 'inativo'

  const limparTemporizadores = useCallback(() => {
    for (const temporizador of temporizadoresRef.current) {
      window.clearTimeout(temporizador)
    }
    temporizadoresRef.current = []
  }, [])

  useEffect(() => limparTemporizadores, [limparTemporizadores])

  useEffect(() => {
    if (!mapa) setRegiao('hub')
  }, [mapa, setRegiao])

  useEffect(() => {
    if (regiao !== 'criacao') {
      onProgressaoCriacaoChange?.(null)
    }
  }, [onProgressaoCriacaoChange, regiao])

  const acionarPortal = useCallback((portal: PortalMapa) => {
    const destino = resolverDestinoPortal(portal)
    const agora = Date.now()

    if (
      !playing ||
      transicaoAtivaRef.current ||
      !destino ||
      !podeAcionarPortalComCooldown(cooldownPortalRef.current, agora)
    ) {
      return
    }

    transicaoAtivaRef.current = true
    cooldownPortalRef.current = iniciarCooldownPortal(
      cooldownPortalRef.current,
      agora,
    )
    setPortalProximo(null)
    setDestinoTransicao(destino)
    setFaseTransicao('saindo')

    const trocarRegiao = window.setTimeout(() => {
      setFaseTransicao('trocando')
      setRegiao(destino)

      const iniciarEntrada = window.setTimeout(() => {
        setFaseTransicao('entrando')

        const concluirEntrada = window.setTimeout(() => {
          cooldownPortalRef.current = {
            ...cooldownPortalRef.current,
            armado: true,
          }
          transicaoAtivaRef.current = false
          setFaseTransicao('inativo')
          setDestinoTransicao(null)
        }, DURACAO_ENTRADA_PORTAL_MS)

        temporizadoresRef.current.push(concluirEntrada)
      }, DURACAO_TROCA_PORTAL_MS)

      temporizadoresRef.current.push(iniciarEntrada)
    }, DURACAO_SAIDA_PORTAL_MS)

    temporizadoresRef.current.push(trocarRegiao)
  }, [playing, setRegiao])

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
          onSceneReady?.()
        }}
      >
        <Suspense fallback={<PhysicsFallback />}>
          <Physics key={`physics-${regiao}`} gravity={[0, -9.81, 0]}>
            {mapa ? (
              <World
                key={regiao}
                playing={mundoAtivo}
                regiao={regiao}
                mapa={mapa}
                portais={portaisPorRegiao[regiao]}
                onPortalProximo={setPortalProximo}
                onPortalAcionado={acionarPortal}
                onProgressaoCriacaoChange={onProgressaoCriacaoChange}
                onInteracaoCriacaoProxima={setInteracaoCriacaoProxima}
              />
            ) : (
              <RegionFallback />
            )}
          </Physics>
        </Suspense>
      </Canvas>
      <PortalPrompt
        portal={
          mundoAtivo && !interacaoCriacaoProxima ? portalProximo : null
        }
      />
      <CreationInteractionPrompt
        tipo={mundoAtivo ? interacaoCriacaoProxima : null}
      />
      <PortalTransitionOverlay
        fase={faseTransicao}
        destino={destinoTransicao}
      />
    </KeyboardControls>
  )
}
