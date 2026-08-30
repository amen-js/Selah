import type { MomentoCriacaoId } from '../progression'

export type ProceduralVfxAssetId =
  | 'ambiente-vazio'
  | 'luz-guia'
  | 'nucleo-luz'
  | 'marcadores-caminho-luz'
  | 'efeito-crescimento'
  | 'sol'
  | 'lua'
  | 'estrelas'
  | 'nuvens'

export interface EfeitosCriacaoProps {
  momentoId: MomentoCriacaoId
  enabled?: boolean
  reducedMotion?: boolean
}

export interface OpcoesConfiguracaoEfeitos {
  reducedMotion?: boolean
}

export interface ConfiguracaoEfeitoIndividual {
  id: ProceduralVfxAssetId
  ativo: boolean
  reducedMotion: boolean
}

export interface ConfiguracaoEfeitosCriacao {
  momentoId: MomentoCriacaoId
  faseCenario: string
  reducedMotion: boolean
  efeitosAtivos: readonly ProceduralVfxAssetId[]
  todasEntradas: readonly ConfiguracaoEfeitoIndividual[]
  temEfeito: (id: ProceduralVfxAssetId) => boolean
}

export interface PontoParticula {
  x: number
  y: number
  z: number
  velocidade: number
  fase: number
  tamanho: number
}

export interface PontoCrescimento {
  origem: [number, number, number]
  deslocamento: [number, number, number]
  velocidade: number
  fase: number
  escala: number
  corIndex: number
}

export interface PontoEstrela {
  x: number
  y: number
  z: number
  tamanho: number
  fase: number
  frequencia: number
  brilhoBase: number
}

export interface PontoNuvem {
  posicao: [number, number, number]
  escala: [number, number, number]
  velocidade: number
}
