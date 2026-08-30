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
})
