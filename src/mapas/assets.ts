import type { PropMapa } from './types'

type ReferenciaModelo = Required<Pick<PropMapa, 'modelo' | 'modeloNo'>>

const raizNatureza = '/models/quaternius/ultimate-stylized-nature'

/** Pieces approved for map data from the project-supplied CC0 model pack. */
export const modelosNatureza = {
  arvore1: {
    modelo: `${raizNatureza}/trees.glb`,
    modeloNo: 'NormalTree_1',
  },
  arvore2: {
    modelo: `${raizNatureza}/trees.glb`,
    modeloNo: 'NormalTree_2',
  },
  arvore3: {
    modelo: `${raizNatureza}/trees.glb`,
    modeloNo: 'NormalTree_3',
  },
  arvore4: {
    modelo: `${raizNatureza}/trees.glb`,
    modeloNo: 'NormalTree_4',
  },
  arvore5: {
    modelo: `${raizNatureza}/trees.glb`,
    modeloNo: 'NormalTree_5',
  },
  pedra1: {
    modelo: `${raizNatureza}/rocks.glb`,
    modeloNo: 'Rock_1',
  },
  pedra2: {
    modelo: `${raizNatureza}/rocks.glb`,
    modeloNo: 'Rock_2',
  },
  pedra3: {
    modelo: `${raizNatureza}/rocks.glb`,
    modeloNo: 'Rock_3',
  },
  pedra4: {
    modelo: `${raizNatureza}/rocks.glb`,
    modeloNo: 'Rock_4',
  },
  pedra5: {
    modelo: `${raizNatureza}/rocks.glb`,
    modeloNo: 'Rock_5',
  },
  gramaAlta: {
    modelo: `${raizNatureza}/grass.glb`,
    modeloNo: 'Grass_Large_Extruded',
  },
  gramaBaixa: {
    modelo: `${raizNatureza}/grass.glb`,
    modeloNo: 'Grass_Small',
  },
  arbustoFlorido: {
    modelo: `${raizNatureza}/flower-bushes.glb`,
    modeloNo: 'Plant_Flowers',
  },
  folhagem: {
    modelo: `${raizNatureza}/flower-bushes.glb`,
    modeloNo: 'Plant_2',
  },
} as const satisfies Record<string, ReferenciaModelo>
