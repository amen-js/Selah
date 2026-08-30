import {
  ColetaveisRegiao,
  RAIO_ATIVACAO_PADRAO,
  type ColetaveisRegiaoProps,
} from '../region/ColetaveisRegiao'

export { RAIO_ATIVACAO_PADRAO }
export type ColetaveisCriacaoProps = ColetaveisRegiaoProps

/** Compatibility wrapper for the original Criação-specific import path. */
export function ColetaveisCriacao(props: ColetaveisCriacaoProps) {
  return <ColetaveisRegiao {...props} />
}
