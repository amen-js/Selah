import type { EspecieVisualNoe } from './animais'

function MaterialAnimal({
  cor,
  emissive,
}: {
  cor: string
  emissive?: string
}) {
  return (
    <meshStandardMaterial
      color={cor}
      emissive={emissive ?? '#000000'}
      emissiveIntensity={emissive ? 0.14 : 0}
      roughness={0.78}
    />
  )
}

function Patas({ cor, descansando }: { cor: string; descansando: boolean }) {
  const altura = descansando ? 0.16 : 0.48
  const y = descansando ? -0.34 : -0.5

  return (
    <group name="patas">
      {[
        [-0.3, y, -0.42],
        [0.3, y, -0.42],
        [-0.3, y, 0.42],
        [0.3, y, 0.42],
      ].map(([x, py, z], indice) => (
        <mesh key={indice} position={[x, py, z]} castShadow>
          <cylinderGeometry args={[0.09, 0.11, altura, 7]} />
          <MaterialAnimal cor={cor} />
        </mesh>
      ))}
    </group>
  )
}

function Elefante({ descansando }: { descansando: boolean }) {
  const cor = '#8faeb6'
  return (
    <group name="elefante-storybook" scale={descansando ? [1, 0.88, 1] : 1}>
      <mesh castShadow scale={[0.72, 0.52, 0.9]}>
        <sphereGeometry args={[0.72, 12, 9]} />
        <MaterialAnimal cor={cor} />
      </mesh>
      <group position={[0, 0.08, 0.84]}>
        <mesh castShadow scale={[0.55, 0.52, 0.48]}>
          <sphereGeometry args={[0.64, 12, 9]} />
          <MaterialAnimal cor={cor} />
        </mesh>
        {[-0.42, 0.42].map((x) => (
          <mesh key={x} position={[x, 0.05, -0.06]} scale={[0.16, 0.42, 0.36]}>
            <sphereGeometry args={[0.78, 10, 8]} />
            <MaterialAnimal cor="#a8c1c6" />
          </mesh>
        ))}
        <mesh position={[0, -0.47, 0.26]} rotation={[0.28, 0, 0]}>
          <capsuleGeometry args={[0.1, 0.58, 5, 8]} />
          <MaterialAnimal cor={cor} />
        </mesh>
        {[-0.15, 0.15].map((x) => (
          <mesh key={x} position={[x, 0.18, 0.44]}>
            <sphereGeometry args={[0.035, 7, 6]} />
            <meshBasicMaterial color="#253033" />
          </mesh>
        ))}
      </group>
      <Patas cor={cor} descansando={descansando} />
    </group>
  )
}

function Girafa({ descansando }: { descansando: boolean }) {
  const cor = '#efc66e'
  return (
    <group name="girafa-storybook" scale={descansando ? [1, 0.82, 1] : 1}>
      <mesh castShadow scale={[0.52, 0.42, 0.78]}>
        <sphereGeometry args={[0.68, 12, 9]} />
        <MaterialAnimal cor={cor} />
      </mesh>
      <mesh position={[0, 0.68, 0.48]} rotation={[-0.13, 0, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.2, 1.42, 9]} />
        <MaterialAnimal cor={cor} />
      </mesh>
      <group position={[0, 1.38, 0.58]}>
        <mesh castShadow scale={[0.35, 0.28, 0.48]}>
          <sphereGeometry args={[0.62, 10, 8]} />
          <MaterialAnimal cor={cor} />
        </mesh>
        {[-0.14, 0.14].map((x) => (
          <group key={x} position={[x, 0.26, 0]}>
            <mesh>
              <cylinderGeometry args={[0.025, 0.035, 0.25, 6]} />
              <MaterialAnimal cor="#a66f3d" />
            </mesh>
            <mesh position={[0, 0.14, 0]}>
              <sphereGeometry args={[0.05, 7, 5]} />
              <MaterialAnimal cor="#7c5130" />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.05, 0.3]}>
          <sphereGeometry args={[0.035, 7, 6]} />
          <meshBasicMaterial color="#3a2d27" />
        </mesh>
      </group>
      {[
        [-0.28, 0.18, -0.38],
        [0.28, 0.08, 0.22],
        [0, 0.62, 0.46],
      ].map(([x, y, z], indice) => (
        <mesh key={indice} position={[x, y, z]} scale={[0.12, 0.09, 0.06]}>
          <sphereGeometry args={[1, 8, 6]} />
          <MaterialAnimal cor="#ad7138" />
        </mesh>
      ))}
      <Patas cor={cor} descansando={descansando} />
    </group>
  )
}

function Leao({ descansando }: { descansando: boolean }) {
  const cor = '#dca054'
  return (
    <group name="leao-storybook" scale={descansando ? [1, 0.82, 1] : 1}>
      <mesh castShadow scale={[0.62, 0.43, 0.82]}>
        <sphereGeometry args={[0.7, 12, 9]} />
        <MaterialAnimal cor={cor} />
      </mesh>
      <group position={[0, 0.12, 0.72]}>
        <mesh castShadow scale={[0.58, 0.58, 0.34]}>
          <sphereGeometry args={[0.65, 12, 9]} />
          <MaterialAnimal cor="#a96135" />
        </mesh>
        <mesh position={[0, 0, 0.18]} castShadow scale={[0.4, 0.38, 0.32]}>
          <sphereGeometry args={[0.65, 12, 9]} />
          <MaterialAnimal cor={cor} />
        </mesh>
        <mesh position={[0, -0.04, 0.42]} scale={[0.2, 0.13, 0.12]}>
          <sphereGeometry args={[0.5, 8, 6]} />
          <MaterialAnimal cor="#6f4931" />
        </mesh>
        {[-0.13, 0.13].map((x) => (
          <mesh key={x} position={[x, 0.1, 0.39]}>
            <sphereGeometry args={[0.035, 7, 6]} />
            <meshBasicMaterial color="#2f2925" />
          </mesh>
        ))}
      </group>
      <Patas cor={cor} descansando={descansando} />
    </group>
  )
}

function Ovelha({ descansando }: { descansando: boolean }) {
  return (
    <group name="ovelha-storybook" scale={descansando ? [1, 0.8, 1] : 1}>
      {[
        [-0.28, 0.06, 0],
        [0.1, 0.14, -0.18],
        [0.28, 0.02, 0.16],
        [-0.05, -0.04, 0.25],
      ].map(([x, y, z], indice) => (
        <mesh key={indice} castShadow position={[x, y, z]}>
          <sphereGeometry args={[0.42, 10, 8]} />
          <MaterialAnimal cor="#f2ead6" />
        </mesh>
      ))}
      <group position={[0, 0.02, 0.62]}>
        <mesh castShadow scale={[0.38, 0.38, 0.45]}>
          <sphereGeometry args={[0.55, 10, 8]} />
          <MaterialAnimal cor="#6d5647" />
        </mesh>
        {[-0.12, 0.12].map((x) => (
          <mesh key={x} position={[x, 0.08, 0.24]}>
            <sphereGeometry args={[0.03, 7, 6]} />
            <meshBasicMaterial color="#fff7e7" />
          </mesh>
        ))}
      </group>
      <Patas cor="#6d5647" descansando={descansando} />
    </group>
  )
}

function Zebra({ descansando }: { descansando: boolean }) {
  const cor = '#e4e0d5'
  return (
    <group name="zebra-storybook" scale={descansando ? [1, 0.82, 1] : 1}>
      <mesh castShadow scale={[0.58, 0.42, 0.8]}>
        <sphereGeometry args={[0.7, 12, 9]} />
        <MaterialAnimal cor={cor} />
      </mesh>
      {[-0.35, 0, 0.35].map((z) => (
        <mesh key={z} position={[0, 0.02, z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.38, 0.055, 6, 12]} />
          <MaterialAnimal cor="#3d4140" />
        </mesh>
      ))}
      <group position={[0, 0.18, 0.72]}>
        <mesh castShadow scale={[0.34, 0.42, 0.48]}>
          <sphereGeometry args={[0.58, 10, 8]} />
          <MaterialAnimal cor={cor} />
        </mesh>
        <mesh position={[0, 0.04, 0.28]} scale={[0.3, 0.08, 0.12]}>
          <boxGeometry args={[1, 1, 1]} />
          <MaterialAnimal cor="#3d4140" />
        </mesh>
        {[-0.12, 0.12].map((x) => (
          <mesh key={x} position={[x, 0.12, 0.29]}>
            <sphereGeometry args={[0.03, 7, 6]} />
            <meshBasicMaterial color="#252827" />
          </mesh>
        ))}
      </group>
      <Patas cor="#d7d4ca" descansando={descansando} />
    </group>
  )
}

function Coelho({ descansando }: { descansando: boolean }) {
  const cor = '#d7b8ce'
  return (
    <group name="coelho-storybook" scale={descansando ? [1, 0.83, 1] : 1}>
      <mesh castShadow position={[0, -0.08, 0]} scale={[0.48, 0.45, 0.62]}>
        <sphereGeometry args={[0.62, 11, 8]} />
        <MaterialAnimal cor={cor} />
      </mesh>
      <group position={[0, 0.28, 0.42]}>
        <mesh castShadow>
          <sphereGeometry args={[0.32, 10, 8]} />
          <MaterialAnimal cor="#e4c9da" />
        </mesh>
        {[-0.13, 0.13].map((x) => (
          <mesh key={x} position={[x, 0.38, -0.03]}>
            <capsuleGeometry args={[0.065, 0.38, 4, 8]} />
            <MaterialAnimal cor={cor} />
          </mesh>
        ))}
        <mesh position={[0, -0.02, 0.29]}>
          <sphereGeometry args={[0.045, 7, 6]} />
          <MaterialAnimal cor="#8d5b6b" />
        </mesh>
        {[-0.11, 0.11].map((x) => (
          <mesh key={x} position={[x, 0.09, 0.27]}>
            <sphereGeometry args={[0.035, 7, 6]} />
            <meshBasicMaterial color="#34302f" />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0, -0.42]}>
        <sphereGeometry args={[0.16, 9, 7]} />
        <MaterialAnimal cor="#f0e5e9" />
      </mesh>
    </group>
  )
}

function Ave({ descansando }: { descansando: boolean }) {
  const cor = '#f0c963'
  return (
    <group
      name="ave-storybook"
      rotation={[descansando ? 0.12 : -0.12, 0, 0]}
    >
      <mesh castShadow scale={[0.34, 0.3, 0.5]}>
        <sphereGeometry args={[0.62, 10, 8]} />
        <MaterialAnimal cor={cor} emissive="#765417" />
      </mesh>
      <mesh position={[0, 0.2, 0.38]}>
        <sphereGeometry args={[0.2, 9, 7]} />
        <MaterialAnimal cor="#f6db81" />
      </mesh>
      <mesh position={[0, 0.18, 0.61]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.085, 0.25, 6]} />
        <MaterialAnimal cor="#e27d43" />
      </mesh>
      {[-0.3, 0.3].map((x) => (
        <mesh
          key={x}
          position={[x, 0, 0]}
          rotation={[0, 0, x < 0 ? -0.55 : 0.55]}
          scale={[0.32, 0.08, 0.42]}
        >
          <sphereGeometry args={[0.65, 9, 7]} />
          <MaterialAnimal cor="#dba844" />
        </mesh>
      ))}
      {[-0.07, 0.07].map((x) => (
        <mesh key={x} position={[x, -0.3, 0.08]}>
          <cylinderGeometry args={[0.015, 0.015, 0.25, 5]} />
          <MaterialAnimal cor="#b9653e" />
        </mesh>
      ))}
    </group>
  )
}

function AnimalNoe({
  especie,
  descansando,
}: {
  especie: EspecieVisualNoe
  descansando: boolean
}) {
  if (especie === 'elefante') return <Elefante descansando={descansando} />
  if (especie === 'girafa') return <Girafa descansando={descansando} />
  if (especie === 'leao') return <Leao descansando={descansando} />
  if (especie === 'ovelha') return <Ovelha descansando={descansando} />
  if (especie === 'zebra') return <Zebra descansando={descansando} />
  if (especie === 'coelho') return <Coelho descansando={descansando} />
  return <Ave descansando={descansando} />
}

const posicoesGrupo = [
  [-0.72, 0, 0.1],
  [0.68, 0, 0.18],
  [-0.12, 0, -0.72],
  [0.95, 0, -0.72],
] as const

const escalaPorEspecie: Readonly<Record<EspecieVisualNoe, number>> = {
  ave: 0.72,
  coelho: 0.74,
  elefante: 0.88,
  girafa: 0.78,
  leao: 0.82,
  ovelha: 0.78,
  zebra: 0.82,
}

/** A visual family always contains at least two creatures. */
export function GrupoAnimaisNoe({
  especies,
  descansando = false,
  escala = 1,
}: {
  especies: readonly EspecieVisualNoe[]
  descansando?: boolean
  escala?: number
}) {
  const especiesSeguras = especies.length >= 2 ? especies : [especies[0], especies[0]]

  return (
    <group name="familia-animais-noe" scale={escala}>
      {especiesSeguras.slice(0, 4).map((especie, indice) => {
        if (!especie) return null
        const posicao = posicoesGrupo[indice] ?? posicoesGrupo[0]
        const escalaFilhote = indice < 2 ? 1 : 0.72
        return (
          <group
            key={`${especie}-${indice}`}
            position={[...posicao]}
            scale={escalaPorEspecie[especie] * escalaFilhote}
            rotation={[0, indice % 2 === 0 ? 0.16 : -0.16, 0]}
          >
            <AnimalNoe especie={especie} descansando={descansando} />
          </group>
        )
      })}
    </group>
  )
}

function PessoaNoe({
  corTunica,
  escala,
  descansando,
}: {
  corTunica: string
  escala: number
  descansando: boolean
}) {
  return (
    <group scale={escala} name="pessoa-familia-noe">
      <mesh position={[0, descansando ? 0.74 : 1.25, 0]} castShadow>
        <sphereGeometry args={[0.22, 12, 9]} />
        <MaterialAnimal cor="#9b694c" />
      </mesh>
      <mesh
        position={[0, descansando ? 0.37 : 0.72, 0]}
        rotation={[0, 0, descansando ? -0.08 : 0]}
        castShadow
      >
        <coneGeometry args={[0.38, 0.95, 10]} />
        <MaterialAnimal cor={corTunica} />
      </mesh>
      {[-0.24, 0.24].map((x) => (
        <mesh
          key={x}
          position={[x, descansando ? 0.4 : 0.74, 0]}
          rotation={[0, 0, x < 0 ? -0.35 : 0.35]}
        >
          <capsuleGeometry args={[0.045, 0.42, 4, 7]} />
          <MaterialAnimal cor="#9b694c" />
        </mesh>
      ))}
    </group>
  )
}

export function FamiliaNoeEmGrupo({ descansando = false }: { descansando?: boolean }) {
  return (
    <group name="familia-noe-em-grupo">
      <group position={[-0.62, 0, 0.08]}>
        <PessoaNoe corTunica="#5c8f89" escala={0.95} descansando={descansando} />
      </group>
      <group position={[0.18, 0, -0.08]}>
        <PessoaNoe corTunica="#a56b48" escala={0.88} descansando={descansando} />
      </group>
      <group position={[0.84, 0, 0.12]}>
        <PessoaNoe corTunica="#6e7fa8" escala={0.82} descansando={descansando} />
      </group>
    </group>
  )
}
