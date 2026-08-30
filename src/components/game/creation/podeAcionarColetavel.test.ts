import { describe, expect, it } from 'vitest'

import { podeAcionarColetavel, type CondicoesColetavel } from './podeAcionarColetavel'

const condicoesPermitidas: CondicoesColetavel = {
  enabled: true,
  jaAcionado: false,
  selahAtivo: false,
  pausaParentalAtiva: false,
  passagemColetada: false,
}

describe('podeAcionarColetavel', () => {
  it('permite o gatilho quando todas as condições estão livres', () => {
    expect(podeAcionarColetavel(condicoesPermitidas)).toBe(true)
  })

  it.each([
    ['desabilitado', { enabled: false }],
    ['já acionado', { jaAcionado: true }],
    ['Selah ativo', { selahAtivo: true }],
    ['pausa parental ativa', { pausaParentalAtiva: true }],
    ['passagem já coletada', { passagemColetada: true }],
  ])('bloqueia quando está %s', (_, bloqueio) => {
    expect(
      podeAcionarColetavel({ ...condicoesPermitidas, ...bloqueio }),
    ).toBe(false)
  })
})
