import { momentosNoe } from '../progression/catalogo'
import type { AreaNoeId, MomentoNoeId } from '../progression/types'

export type Vetor3AssetNoe = readonly [number, number, number]

export const idsAssetsCanteiroNoe = [
  'canteiro-bancada',
  'canteiro-machado',
  'canteiro-martelo',
  'canteiro-balde',
  'canteiro-barril',
  'canteiro-caixa',
  'vale-pedra-morro',
  'canteiro-tabuas',
  'canteiro-madeira',
  'canteiro-tronco',
  'canteiro-tronco-curto',
] as const

export type AssetNoeId = (typeof idsAssetsCanteiroNoe)[number]

export interface FallbackAssetNoe {
  tipo: 'primitivo'
  geometria: 'cuboid' | 'cylinder' | 'icosahedron'
  /** Full visual dimensions in world metres. */
  dimensoes: Vetor3AssetNoe
  cor: `#${string}`
}

export type ColisorAssetNoe =
  | { tipo: 'nenhum' }
  | {
      tipo: 'cuboid'
      /** Physics dimensions are authored in metres, not derived from GLB scale. */
      meiaExtensaoMetros: Vetor3AssetNoe
      deslocamentoMetros: Vetor3AssetNoe
    }

export type LicencaAssetNoe =
  | {
      origem: 'pack-oficial'
      urlFonte: string
      criador: 'Kenney'
      identificador: 'CC0-1.0'
      arquivoOrigem: string
      sha256: string
    }
  | {
      origem: 'fornecido-pelo-projeto'
      urlFonte: 'project-supplied://selah/2026-08-30'
      criador: 'não-declarado'
      identificador: 'Project-supplied'
      arquivoOrigem: 'pedra_morro.glb'
      sha256: string
    }

export interface EntradaManifestoAssetNoe {
  id: AssetNoeId
  areaId: AreaNoeId
  momentoMinimo: MomentoNoeId
  urlRuntime: string
  bytes: number
  escalaVisual: number
  deslocamentoVisualMetros?: Vetor3AssetNoe
  fallback: FallbackAssetNoe
  colisor: ColisorAssetNoe
  licenca: LicencaAssetNoe
}

export interface DependenciaTexturaAssetNoe {
  id: 'kenney-survival-colormap'
  urlRuntime: string
  bytes: number
  licenca: LicencaAssetNoe
}

export interface ManifestoAssetsNoe {
  versao: 1
  texturaCompartilhada: DependenciaTexturaAssetNoe
  entradas: readonly EntradaManifestoAssetNoe[]
}

const DIRETORIO_RUNTIME = '/models/noah/shared/kenney/survival'
const DIRETORIO_ORIGEM = 'Models/GLB format'
const FONTE_OFICIAL = 'https://kenney.nl/assets/survival-kit'
const AREA_CANTEIRO: AreaNoeId = 'canteiro-vale'

type EntradaKenney = Omit<
  EntradaManifestoAssetNoe,
  'areaId' | 'urlRuntime' | 'licenca'
> & {
  arquivo: string
  sha256: string
}

function entradaKenney({
  arquivo,
  sha256,
  ...entrada
}: EntradaKenney): EntradaManifestoAssetNoe {
  return {
    ...entrada,
    areaId: AREA_CANTEIRO,
    urlRuntime: `${DIRETORIO_RUNTIME}/${arquivo}`,
    licenca: {
      origem: 'pack-oficial',
      urlFonte: FONTE_OFICIAL,
      criador: 'Kenney',
      identificador: 'CC0-1.0',
      arquivoOrigem: `${DIRETORIO_ORIGEM}/${arquivo}`,
      sha256,
    },
  }
}

const semColisor = { tipo: 'nenhum' } as const

export const manifestoAssetsNoe: ManifestoAssetsNoe = {
  versao: 1,
  texturaCompartilhada: {
    id: 'kenney-survival-colormap',
    urlRuntime: `${DIRETORIO_RUNTIME}/Textures/colormap.png`,
    bytes: 7_440,
    licenca: {
      origem: 'pack-oficial',
      urlFonte: FONTE_OFICIAL,
      criador: 'Kenney',
      identificador: 'CC0-1.0',
      arquivoOrigem: `${DIRETORIO_ORIGEM}/Textures/colormap.png`,
      sha256:
        '6ca023be9f12e8c2358fcf94320c8a894b4c05a3dd0bad1f5c268312053caca1',
    },
  },
  entradas: [
    entradaKenney({
      id: 'canteiro-bancada',
      arquivo: 'workbench.glb',
      momentoMinimo: 'chamado-canteiro',
      bytes: 26_104,
      escalaVisual: 3,
      fallback: {
        tipo: 'primitivo',
        geometria: 'cuboid',
        dimensoes: [0.9, 0.72, 0.9],
        cor: '#8b5a2b',
      },
      colisor: {
        tipo: 'cuboid',
        meiaExtensaoMetros: [0.46, 0.36, 0.46],
        deslocamentoMetros: [0, 0.36, 0],
      },
      sha256:
        'bf72d2d535fa29127e5078a6c4c2023a74fa5cd7d02d91ad550e897e088e1dc8',
    }),
    entradaKenney({
      id: 'canteiro-machado',
      arquivo: 'tool-axe.glb',
      momentoMinimo: 'chamado-canteiro',
      bytes: 8_612,
      escalaVisual: 3,
      fallback: {
        tipo: 'primitivo',
        geometria: 'cuboid',
        dimensoes: [0.12, 0.78, 0.1],
        cor: '#6b7280',
      },
      colisor: semColisor,
      sha256:
        'de5c6cc51cdb5bcfad8bd7128b7ff0e37a34e6f4f8deddec82bb8634c25cc20d',
    }),
    entradaKenney({
      id: 'canteiro-martelo',
      arquivo: 'tool-hammer.glb',
      momentoMinimo: 'chamado-canteiro',
      bytes: 6_520,
      escalaVisual: 3,
      fallback: {
        tipo: 'primitivo',
        geometria: 'cuboid',
        dimensoes: [0.28, 0.48, 0.15],
        cor: '#6b7280',
      },
      colisor: semColisor,
      sha256:
        '9b27f03c26dabd49a7ea358615e63fe65e1c3d0157887d4ee1ecdfa1f0e688f3',
    }),
    entradaKenney({
      id: 'canteiro-balde',
      arquivo: 'bucket.glb',
      momentoMinimo: 'chamado-canteiro',
      bytes: 7_816,
      escalaVisual: 3,
      fallback: {
        tipo: 'primitivo',
        geometria: 'cylinder',
        dimensoes: [0.44, 0.58, 0.44],
        cor: '#64748b',
      },
      colisor: semColisor,
      sha256:
        'ff173908480929067cd634d5edfedba038428f1503db487521492975fa5c8274',
    }),
    entradaKenney({
      id: 'canteiro-barril',
      arquivo: 'barrel.glb',
      momentoMinimo: 'chamado-canteiro',
      bytes: 34_256,
      escalaVisual: 3,
      fallback: {
        tipo: 'primitivo',
        geometria: 'cylinder',
        dimensoes: [0.72, 1.04, 0.72],
        cor: '#7c4a21',
      },
      colisor: {
        tipo: 'cuboid',
        meiaExtensaoMetros: [0.36, 0.52, 0.36],
        deslocamentoMetros: [0, 0.52, 0],
      },
      sha256:
        '3a0d12f6bdd1badd361f64ce0fbbf878a4ccfc2de8ff1ac4ed4c1aea2a9ee04a',
    }),
    entradaKenney({
      id: 'canteiro-caixa',
      arquivo: 'box.glb',
      momentoMinimo: 'chamado-canteiro',
      bytes: 14_056,
      escalaVisual: 3,
      fallback: {
        tipo: 'primitivo',
        geometria: 'cuboid',
        dimensoes: [0.75, 0.75, 0.75],
        cor: '#9a6a3a',
      },
      colisor: {
        tipo: 'cuboid',
        meiaExtensaoMetros: [0.38, 0.38, 0.38],
        deslocamentoMetros: [0, 0.38, 0],
      },
      sha256:
        '346eebd23986793b992ca6e05e9f98d6f5db96a9bfa3aa7c8360ac8b7920def8',
    }),
    {
      id: 'vale-pedra-morro',
      areaId: AREA_CANTEIRO,
      momentoMinimo: 'chamado-canteiro',
      urlRuntime: '/models/noah/terrain/project-supplied/pedra-morro.glb',
      bytes: 355_528,
      escalaVisual: 1,
      deslocamentoVisualMetros: [0, 4.1, 0],
      fallback: {
        tipo: 'primitivo',
        geometria: 'icosahedron',
        dimensoes: [8.2, 8.03, 8.19],
        cor: '#77756f',
      },
      colisor: semColisor,
      licenca: {
        origem: 'fornecido-pelo-projeto',
        urlFonte: 'project-supplied://selah/2026-08-30',
        criador: 'não-declarado',
        identificador: 'Project-supplied',
        arquivoOrigem: 'pedra_morro.glb',
        sha256:
          '75d3800fd13daa98ecd8bed65bef2318a9c269d8d3bef6a0ebb35b3bbb668ca0',
      },
    },
    entradaKenney({
      id: 'canteiro-tabuas',
      arquivo: 'resource-planks.glb',
      momentoMinimo: 'coleta-vedacao',
      bytes: 8_884,
      escalaVisual: 3,
      fallback: {
        tipo: 'primitivo',
        geometria: 'cuboid',
        dimensoes: [1.12, 0.28, 1.88],
        cor: '#a86d32',
      },
      colisor: semColisor,
      sha256:
        'd3804257474a3baab7ac067be91de5c3d6d18d5803775dc876cb6d9442c30873',
    }),
    entradaKenney({
      id: 'canteiro-madeira',
      arquivo: 'resource-wood.glb',
      momentoMinimo: 'coleta-vedacao',
      bytes: 7_272,
      escalaVisual: 3,
      fallback: {
        tipo: 'primitivo',
        geometria: 'cuboid',
        dimensoes: [0.62, 0.2, 0.3],
        cor: '#85532b',
      },
      colisor: semColisor,
      sha256:
        '1d5f559da9432f89bd323731ef76b60372e0deb261a96d0da8d5af570c485d80',
    }),
    entradaKenney({
      id: 'canteiro-tronco',
      arquivo: 'tree-log.glb',
      momentoMinimo: 'coleta-vedacao',
      bytes: 9_180,
      escalaVisual: 3,
      fallback: {
        tipo: 'primitivo',
        geometria: 'cylinder',
        dimensoes: [0.76, 0.84, 3],
        cor: '#704122',
      },
      colisor: semColisor,
      sha256:
        'bd358e55e63a75bd54bea1e4b40ed362baa937ce8e503f2aa2370a5a1d9da11c',
    }),
    entradaKenney({
      id: 'canteiro-tronco-curto',
      arquivo: 'tree-log-small.glb',
      momentoMinimo: 'coleta-vedacao',
      bytes: 9_216,
      escalaVisual: 3,
      fallback: {
        tipo: 'primitivo',
        geometria: 'cylinder',
        dimensoes: [0.75, 0.83, 1.95],
        cor: '#704122',
      },
      colisor: semColisor,
      sha256:
        '5b416addc4cb01d9d6ad30ec282606a8fefb018043d3253d5e42c1e353aab3c8',
    }),
  ],
}

const indicePorMomento = new Map<MomentoNoeId, number>(
  momentosNoe.map((momento, indice) => [momento.id, indice]),
)

/** Returns only assets owned by the active area and already unlocked in order. */
export function selecionarAssetsNoePorAreaEMomento(
  areaId: AreaNoeId,
  momentoAtualId: MomentoNoeId,
): readonly EntradaManifestoAssetNoe[] {
  const indiceAtual = indicePorMomento.get(momentoAtualId)
  if (indiceAtual === undefined) return []

  return manifestoAssetsNoe.entradas.filter((entrada) => {
    const indiceMinimo = indicePorMomento.get(entrada.momentoMinimo)
    return (
      entrada.areaId === areaId &&
      indiceMinimo !== undefined &&
      indiceMinimo <= indiceAtual
    )
  })
}

export function obterAssetNoe(
  id: AssetNoeId,
): EntradaManifestoAssetNoe | undefined {
  return manifestoAssetsNoe.entradas.find((entrada) => entrada.id === id)
}
