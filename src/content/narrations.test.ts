import { translate } from '../i18n/translate'
import type { Idioma } from '../types/selah'
import {
  buscarNarracaoAprovada,
  narracoesMissaoNoeIds,
} from './narrations'

const idiomas: readonly Idioma[] = ['pt-BR', 'en-US', 'es-ES']

describe('catálogo compartilhado de narrações', () => {
  it('resolve as três falas localizadas da missão de Noé', () => {
    expect(narracoesMissaoNoeIds).toEqual([
      'noe.mission.line1',
      'noe.mission.line2',
      'noe.mission.line3',
    ])

    for (const narracaoId of narracoesMissaoNoeIds) {
      for (const idioma of idiomas) {
        expect(buscarNarracaoAprovada(narracaoId, idioma)).toEqual({
          narracaoId,
          idioma,
          texto: translate(idioma, narracaoId),
        })
      }
    }
  })

  it('mantém as narrações da Criação no mesmo contrato', () => {
    expect(
      buscarNarracaoAprovada('criacao.vazio.inicial', 'pt-BR'),
    ).toMatchObject({
      narracaoId: 'criacao.vazio.inicial',
      idioma: 'pt-BR',
      texto:
        'No começo, tudo era escuro e bem silencioso... Não havia nada aqui. Dê alguns passos e vamos descobrir o primeiro caminho juntos!',
    })
  })

  it.each([
    ['noe.mission.inexistente', 'pt-BR'],
    [' noe.mission.line1 ', 'pt-BR'],
    ['noe.mission.line1', 'fr-FR'],
    ['toString', 'pt-BR'],
  ])('rejeita ID ou idioma fora da allowlist: %s / %s', (id, idioma) => {
    expect(buscarNarracaoAprovada(id, idioma)).toBeUndefined()
  })
})
