import { momentosCriacao } from './creation/progression'
import {
  chavesJornadaCriacao,
  traduzirJornadaCriacao,
} from './creationJourneyUi'

describe('catálogo de UI da jornada da Criação', () => {
  it('mapeia os nove momentos canônicos para chaves de título e objetivo', () => {
    const idsCanonicos = momentosCriacao.map(({ id }) => id)

    expect(Object.keys(chavesJornadaCriacao)).toEqual(idsCanonicos)
    for (const id of idsCanonicos) {
      expect(chavesJornadaCriacao[id]).toEqual({
        titulo: `creation.journey.${id}.title`,
        objetivo: `creation.journey.${id}.objective`,
      })
    }
  })

  it('resolve títulos e objetivos localizados sem prometer interação por toque', () => {
    const idiomas = ['pt-BR', 'en-US', 'es-ES'] as const
    const idsCanonicos = momentosCriacao.map(({ id }) => id)

    for (const idioma of idiomas) {
      for (const id of idsCanonicos) {
        const texto = traduzirJornadaCriacao(id, idioma)

        expect(texto.titulo.trim()).not.toBe('')
        expect(texto.objetivo.trim()).not.toBe('')
        expect(texto.objetivo).not.toMatch(/\b(touch|tap|toque|toca)\b/i)
      }
    }

    expect(traduzirJornadaCriacao('vazio', 'pt-BR')).toEqual({
      titulo: 'O vazio',
      objetivo: 'Dê alguns passos e descubra o primeiro caminho.',
    })
    expect(traduzirJornadaCriacao('luz', 'en-US')).toEqual({
      titulo: 'The light',
      objetivo: 'Follow the glowing signs and move closer to the light.',
    })
    expect(traduzirJornadaCriacao('luz', 'es-ES')).toEqual({
      titulo: 'La luz',
      objetivo: 'Sigue las señales brillantes y acércate a la luz.',
    })
  })
})
