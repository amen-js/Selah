import { describe, expect, it } from 'vitest'
import { ehTeclaConfirmacaoPortal } from './teclas'

describe('confirmação de entrada no portal', () => {
  it.each([
    [{ code: 'KeyE' }],
    [{ code: 'Enter' }],
    [{ key: 'e' }],
    [{ key: 'E' }],
    [{ key: 'Enter' }],
  ])('aceita %o sem repetição', (evento) => {
    expect(ehTeclaConfirmacaoPortal(evento)).toBe(true)
  })

  it.each([
    [{ code: 'KeyE', repeat: true }],
    [{ code: 'Enter', repeat: true }],
    [{ code: 'Space' }],
    [{ key: 'Escape' }],
  ])('rejeita %o', (evento) => {
    expect(ehTeclaConfirmacaoPortal(evento)).toBe(false)
  })

  it.each(['button', 'select', 'input', 'a']) (
    'preserva Enter do controle focado <%s>',
    (tag) => {
      const controle = document.createElement(tag)
      document.body.append(controle)

      expect(
        ehTeclaConfirmacaoPortal({ key: 'Enter', target: controle }),
      ).toBe(false)

      controle.remove()
    },
  )

  it('preserva controles compostos com role button', () => {
    const controle = document.createElement('div')
    controle.setAttribute('role', 'button')
    const filho = document.createElement('span')
    controle.append(filho)

    expect(
      ehTeclaConfirmacaoPortal({ key: 'Enter', target: filho }),
    ).toBe(false)
  })
})
