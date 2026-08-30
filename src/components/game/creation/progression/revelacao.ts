import {
  momentoCriacaoPorId,
  momentosCriacao,
  type AssetCriacaoId,
} from './catalogo'
import { indiceMomentoCriacao } from './estado'
import type { FaseCenarioCriacao, MomentoCriacaoId } from './types'

export type TipoAssetCriacao =
  | 'ambiente'
  | 'marco'
  | 'prop'
  | 'personagem'
  | 'vfx'
  | 'audio'

export type CarregamentoAssetCriacao =
  | 'compartilhado'
  | 'momento-ativo'
  | 'precarregar-proximo'

/** Contract implemented by the external asset branch; no loader is coupled to it. */
export interface EntradaManifestoAssetCriacao {
  id: AssetCriacaoId
  arquivo: string
  tipo: TipoAssetCriacao
  momentos: readonly MomentoCriacaoId[]
  carregamento: CarregamentoAssetCriacao
  escala: number
  eixoFrontal: '+z' | '-z'
  nosVisuais?: readonly string[]
  nosColisao?: readonly string[]
  ancoras?: readonly string[]
  animacoes?: readonly string[]
  licenca: {
    urlFonte: string
    criador: string
    identificador: string
    sha256: string
  }
}

export interface ManifestoAssetsCriacao {
  versao: 1
  entradas: readonly EntradaManifestoAssetCriacao[]
}

export interface RevelacaoCriacao {
  momentoId: MomentoCriacaoId
  faseCenario: FaseCenarioCriacao
  assetsDoMomento: readonly AssetCriacaoId[]
  assetsVisiveis: readonly AssetCriacaoId[]
}

/**
 * Describes the scene chunk for one beat without loading any model. Asset
 * branches consume the same IDs and remain independent from the game runtime.
 */
export function obterRevelacaoCriacao(
  momentoId: MomentoCriacaoId,
): RevelacaoCriacao {
  const indiceAtual = indiceMomentoCriacao(momentoId)
  const momento = momentoCriacaoPorId.get(momentoId) ?? momentosCriacao[0]
  const assetsVisiveis = [
    ...new Set(
      momentosCriacao
        .slice(0, indiceAtual + 1)
        .flatMap(({ assets }) => assets),
    ),
  ] as AssetCriacaoId[]

  return {
    momentoId: momento.id,
    faseCenario: momento.faseCenario,
    assetsDoMomento: momento.assets,
    assetsVisiveis,
  }
}
