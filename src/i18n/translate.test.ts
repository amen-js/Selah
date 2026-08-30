import type { Idioma } from '../types/selah'
import { catalogs, translate } from './translate'

const placeholderPattern = /\{([a-zA-Z][a-zA-Z0-9]*)\}/g

const placeholders = (value: string) =>
  [...value.matchAll(placeholderPattern)].map((match) => match[1]).sort()

describe('interface translations', () => {
  it('keeps the same non-empty keys in every locale', () => {
    const baseKeys = Object.keys(catalogs['pt-BR']).sort()

    for (const catalog of Object.values(catalogs)) {
      expect(Object.keys(catalog).sort()).toEqual(baseKeys)
      expect(Object.values(catalog).every((value) => value.trim().length > 0)).toBe(true)
    }
  })

  it('keeps interpolation placeholders aligned with pt-BR', () => {
    const base = catalogs['pt-BR']

    for (const [locale, catalog] of Object.entries(catalogs)) {
      for (const key of Object.keys(base) as Array<keyof typeof base>) {
        expect(placeholders(catalog[key]), `${locale}:${key}`).toEqual(placeholders(base[key]))
      }
    }
  })

  it('translates and interpolates text without treating values as markup', () => {
    expect(translate('en-US', 'dialog.aria', { character: '<Lumi>' })).toBe(
      'Dialogue with <Lumi>',
    )
    expect(translate('es-ES', 'hud.passages.other', { count: 3 })).toBe(
      '3 pasajes',
    )
  })

  it('keeps an unresolved placeholder visible for diagnosis', () => {
    expect(translate('en-US', 'dialog.aria')).toBe('Dialogue with {character}')
  })

  it('falls back to pt-BR for an unsupported runtime locale', () => {
    expect(translate('fr-FR' as Idioma, 'app.enter')).toBe('Entrar no mundo')
  })
})
