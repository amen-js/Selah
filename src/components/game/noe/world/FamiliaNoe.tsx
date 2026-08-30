import {
  posicoesFamiliaNoe,
  type PersonagemFamiliaNoeId,
} from './cenografia'

interface PaletaFamiliaNoe {
  pele: string
  sombraPele: string
  cabelo: string
  tunica: string
  faixa: string
}

const paletas: Record<PersonagemFamiliaNoeId, PaletaFamiliaNoe> = {
  noe: {
    pele: '#a96d4a',
    sombraPele: '#7a4934',
    cabelo: '#f0e0c1',
    tunica: '#c9874b',
    faixa: '#f0c978',
  },
  sem: {
    pele: '#b97851',
    sombraPele: '#824c36',
    cabelo: '#4a3027',
    tunica: '#5f8b77',
    faixa: '#e2b96b',
  },
  jafe: {
    pele: '#c48760',
    sombraPele: '#87533d',
    cabelo: '#5b3928',
    tunica: '#7089a3',
    faixa: '#d7a75c',
  },
}

function MaterialPele({ cor }: { cor: string }) {
  return <meshStandardMaterial color={cor} roughness={0.94} />
}

function Rosto({ id }: { id: PersonagemFamiliaNoeId }) {
  const paleta = paletas[id]
  const noe = id === 'noe'

  return (
    <group position={[0, 1.68, 0.02]}>
      <mesh castShadow scale={[0.38, 0.42, 0.36]}>
        <sphereGeometry args={[1, 18, 14]} />
        <MaterialPele cor={paleta.pele} />
      </mesh>
      <mesh
        castShadow
        position={[0, 0.18, -0.08]}
        scale={[0.39, 0.25, 0.31]}
      >
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color={paleta.cabelo} roughness={1} />
      </mesh>

      {[-0.14, 0.14].map((x) => (
        <group key={x} position={[x, 0.035, 0.33]}>
          <mesh scale={[0.055, 0.072, 0.032]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color="#30251f" roughness={0.7} />
          </mesh>
          <mesh position={[-0.015, 0.025, 0.028]} scale={0.015}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial color="#fff7df" />
          </mesh>
        </group>
      ))}

      <mesh position={[0, -0.085, 0.36]} scale={[0.045, 0.05, 0.035]}>
        <sphereGeometry args={[1, 10, 8]} />
        <MaterialPele cor={paleta.sombraPele} />
      </mesh>
      <mesh position={[0, -0.205, 0.36]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.075, 0.011, 6, 18, Math.PI]} />
        <meshStandardMaterial color={paleta.sombraPele} roughness={0.9} />
      </mesh>

      {noe && (
        <>
          <mesh
            castShadow
            position={[0, -0.28, 0.18]}
            scale={[0.27, 0.3, 0.21]}
          >
            <sphereGeometry args={[1, 14, 10]} />
            <meshStandardMaterial color={paleta.cabelo} roughness={1} />
          </mesh>
          <mesh
            castShadow
            position={[0, -0.44, 0.12]}
            scale={[0.2, 0.22, 0.15]}
          >
            <coneGeometry args={[1, 1.6, 10]} />
            <meshStandardMaterial color={paleta.cabelo} roughness={1} />
          </mesh>
        </>
      )}
    </group>
  )
}

function Braco({
  lado,
  paleta,
  acolhendo = false,
}: {
  lado: -1 | 1
  paleta: PaletaFamiliaNoe
  acolhendo?: boolean
}) {
  return (
    <group
      position={[lado * 0.4, 1.16, 0]}
      rotation={[acolhendo ? -0.72 : -0.08, 0, lado * (acolhendo ? 0.34 : 0.08)]}
    >
      <mesh castShadow position={[0, -0.28, 0]} scale={[0.115, 0.36, 0.115]}>
        <capsuleGeometry args={[0.5, 1, 5, 8]} />
        <MaterialPele cor={paleta.pele} />
      </mesh>
      <mesh castShadow position={[0, -0.58, 0.02]} scale={0.115}>
        <sphereGeometry args={[1, 10, 8]} />
        <MaterialPele cor={paleta.pele} />
      </mesh>
    </group>
  )
}

function PersonagemFamiliaNoe({
  id,
  posicao,
  rotacaoY,
  escala,
}: (typeof posicoesFamiliaNoe)[number]) {
  const paleta = paletas[id]
  const noe = id === 'noe'

  return (
    <group
      name={`familia-noe-${id}`}
      position={[...posicao]}
      rotation={[0, rotacaoY, 0]}
      scale={escala}
      userData={{ personagem: id, interativo: id === 'noe' }}
    >
      {[-0.17, 0.17].map((x) => (
        <group key={x} position={[x, 0.36, 0]}>
          <mesh castShadow scale={[0.13, 0.36, 0.13]}>
            <capsuleGeometry args={[0.5, 1, 5, 8]} />
            <meshStandardMaterial color="#5a4634" roughness={0.96} />
          </mesh>
          <mesh
            castShadow
            position={[0, -0.29, 0.08]}
            scale={[0.16, 0.09, 0.23]}
          >
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color="#4a382b" roughness={1} />
          </mesh>
        </group>
      ))}

      <mesh castShadow position={[0, 1.02, 0]} scale={[0.42, 0.57, 0.3]}>
        <capsuleGeometry args={[0.62, 0.82, 6, 12]} />
        <meshStandardMaterial color={paleta.tunica} roughness={0.98} />
      </mesh>
      <mesh castShadow position={[0, 0.78, 0]} scale={[0.5, 0.43, 0.36]}>
        <coneGeometry args={[0.82, 1.3, 8]} />
        <meshStandardMaterial color={paleta.tunica} roughness={0.98} />
      </mesh>
      <mesh castShadow position={[0, 0.98, 0.3]} scale={[0.43, 0.075, 0.05]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={paleta.faixa} roughness={0.88} />
      </mesh>

      <Braco lado={-1} paleta={paleta} acolhendo={noe} />
      <Braco lado={1} paleta={paleta} acolhendo={id === 'sem'} />
      <Rosto id={id} />

      {id === 'jafe' && (
        <group position={[0.42, 0.82, 0.32]} rotation={[0, 0, 0.16]}>
          <mesh castShadow scale={[0.12, 0.66, 0.09]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#8a5a32" roughness={1} />
          </mesh>
          <mesh castShadow position={[0, 0.35, 0]} scale={[0.3, 0.14, 0.12]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#5f6870" roughness={0.82} />
          </mesh>
        </group>
      )}
    </group>
  )
}

/** Storybook silhouettes: round faces, readable poses and modest work clothes. */
export function FamiliaNoe() {
  return (
    <group name="familia-noe-canteiro">
      {posicoesFamiliaNoe.map((personagem) => (
        <PersonagemFamiliaNoe key={personagem.id} {...personagem} />
      ))}
    </group>
  )
}
