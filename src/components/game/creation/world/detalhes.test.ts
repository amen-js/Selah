import { describe, expect, it } from 'vitest'
import type { MomentoCriacaoId } from '../progression/types'
import { obterDetalhesVisiveisCriacao } from './detalhes'

describe('detalhes narrativos persistentes da Criação', () => {
  it.each<[MomentoCriacaoId, boolean, boolean, boolean, boolean]>([
    ['vazio', false, false, false, false],
    ['luz', false, false, false, false],
    ['ceu-terra-aguas', true, false, false, false],
    ['natureza', true, false, false, false],
    ['ceu-ritmo', true, false, false, false],
    ['criaturas', true, true, false, false],
    ['eden', true, true, true, false],
    ['adao-e-eva', true, true, true, false],
    ['fruto-escolha', true, true, true, true],
  ])(
    '%s revela apenas os detalhes já alcançados',
    (momentoId, aguas, fauna, eden, fruto) => {
      expect(obterDetalhesVisiveisCriacao(momentoId)).toEqual({
        aguas,
        fauna,
        eden,
        fruto,
      })
    },
  )
})
