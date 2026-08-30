import { obterClimaNoe } from '../progression/estado'
import type {
  EstadoProgressaoNoe,
  FaseClimaNoe,
} from '../progression/types'

export interface ProjecaoAmbienciaSonoraNoe {
  fase: FaseClimaNoe
  volumeVento: number
  volumeChuva: number
  duracaoFadeMs: number
  ativa: boolean
  trovaoAtivo: false
}

interface ParametrosAmbienciaSonoraNoe {
  volumeVento: number
  volumeChuva: number
  duracaoFadeMs: number
}

export const VOLUME_MAXIMO_AMBIENCIA_NOE = 0.04

const PARAMETROS_POR_FASE: Readonly<
  Record<FaseClimaNoe, ParametrosAmbienciaSonoraNoe>
> = {
  calmo: {
    volumeVento: 0,
    volumeChuva: 0,
    duracaoFadeMs: 900,
  },
  'nuvens-leves': {
    volumeVento: 0.01,
    volumeChuva: 0,
    duracaoFadeMs: 1_800,
  },
  'vento-suave': {
    volumeVento: 0.019,
    volumeChuva: 0,
    duracaoFadeMs: 1_800,
  },
  'abrigo-pronto': {
    volumeVento: 0.028,
    volumeChuva: 0,
    duracaoFadeMs: 2_000,
  },
  'chuva-segura': {
    // The child is already sheltered, so rain remains a quiet exterior texture.
    volumeVento: 0.016,
    volumeChuva: 0.034,
    duracaoFadeMs: 2_400,
  },
  'luz-retornando': {
    volumeVento: 0,
    volumeChuva: 0,
    duracaoFadeMs: 2_800,
  },
  'nova-terra': {
    volumeVento: 0,
    volumeChuva: 0,
    duracaoFadeMs: 1_200,
  },
}

/** Pure sound mix projected from the same durable climate state as the scene. */
export function projetarAmbienciaSonoraNoe(
  estado: EstadoProgressaoNoe,
  enabled: boolean,
): ProjecaoAmbienciaSonoraNoe {
  const clima = obterClimaNoe(estado)
  const parametros = PARAMETROS_POR_FASE[clima.fase]
  const volumeVento = enabled ? parametros.volumeVento : 0
  const volumeChuva = enabled ? parametros.volumeChuva : 0

  return {
    fase: clima.fase,
    volumeVento,
    volumeChuva,
    duracaoFadeMs: enabled ? parametros.duracaoFadeMs : 120,
    ativa: volumeVento > 0 || volumeChuva > 0,
    trovaoAtivo: false,
  }
}
