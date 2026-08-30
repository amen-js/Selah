import type { ColetavelMapa } from '../../../mapas/types'
import { resolverFocoCameraSelah } from './selahFocus'

const cristalCriacao: ColetavelMapa = {
  id: 'cristal-criacao-luz',
  historiaId: 'criacao',
  passagemId: 'GEN.1.3',
  posicao: [4, 1, -6],
}

const cristalNoeMesmaPassagem: ColetavelMapa = {
  id: 'cristal-noe-luz',
  historiaId: 'noe',
  passagemId: cristalCriacao.passagemId,
  posicao: [-4, 2, 6],
}

const coletaveis: readonly ColetavelMapa[] = [cristalCriacao, cristalNoeMesmaPassagem]

describe('resolverFocoCameraSelah', () => {
  it('resolve o cristal usando história e passagem do gatilho', () => {
    expect(
      resolverFocoCameraSelah(
        { historiaId: 'criacao', passagemId: 'GEN.1.3' },
        coletaveis,
      ),
    ).toEqual({
      id: cristalCriacao.id,
      alvo: [4, 1.35, -6],
      distancia: 5,
      elevacao: 1.8,
    })
  })

  it('não confunde passagens iguais em histórias diferentes', () => {
    const foco = resolverFocoCameraSelah(
      { historiaId: 'noe', passagemId: cristalCriacao.passagemId },
      coletaveis,
    )

    expect(foco?.id).toBe(cristalNoeMesmaPassagem.id)
    expect(foco?.alvo).toEqual([-4, 2.35, 6])
  })

  it('retorna null para gatilho ausente ou desconhecido', () => {
    expect(resolverFocoCameraSelah(undefined, coletaveis)).toBeNull()
    expect(resolverFocoCameraSelah(null, coletaveis)).toBeNull()
    expect(
      resolverFocoCameraSelah(
        { historiaId: 'criacao', passagemId: 'GEN.9.1' },
        coletaveis,
      ),
    ).toBeNull()
  })

  it('mantém valores cinematográficos positivos e não altera a lista', () => {
    const entrada = [...coletaveis]
    const foco = resolverFocoCameraSelah(
      { historiaId: cristalCriacao.historiaId, passagemId: cristalCriacao.passagemId },
      entrada,
    )

    expect(foco?.distancia).toBeGreaterThan(0)
    expect(foco?.elevacao).toBeGreaterThan(0)
    expect(entrada).toEqual([...coletaveis])
  })
})
