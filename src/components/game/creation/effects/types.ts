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
