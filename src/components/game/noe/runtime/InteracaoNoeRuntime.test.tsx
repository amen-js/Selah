import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { InteracaoNoeRuntime } from './InteracaoNoeRuntime'
import type {
  CandidatoInteracaoNoe,
  CandidatoPortalNoe,
  CandidatoSelahNoe,
  CandidatoTarefaNoe,
} from './interacao'

function criarCandidatos() {
  const acionarTarefa = vi.fn()
  const acionarSelah = vi.fn()
  const acionarPortal = vi.fn()
  const tarefa: CandidatoTarefaNoe = {
    tipo: 'tarefa',
    id: 'tabua-1',
    distancia: 2,
    acaoId: 'noe.madeira.coletada',
    unidadeId: 'tabua-1',
    acionar: acionarTarefa,
  }
  const selah: CandidatoSelahNoe = {
    tipo: 'selah',
    id: 'selah-vedacao',
    distancia: 1,
    passagemId: 'genesis-6-14',
    acionar: acionarSelah,
  }
  const portal: CandidatoPortalNoe = {
    tipo: 'portal',
    id: 'portal-arca',
    distancia: 0.25,
    acionar: acionarPortal,
  }

  return {
    candidatos: [portal, selah, tarefa] as readonly CandidatoInteracaoNoe[],
    acionarTarefa,
    acionarSelah,
    acionarPortal,
  }
}

describe('InteracaoNoeRuntime', () => {
  it.each([
    ['E', { code: 'KeyE' }],
    ['e', { key: 'e' }],
    ['Enter por code', { code: 'Enter' }],
    ['Enter por key', { key: 'Enter' }],
  ])('aciona exatamente um candidato com %s', (_nome, evento) => {
    const { candidatos, acionarTarefa, acionarSelah, acionarPortal } =
      criarCandidatos()
    render(<InteracaoNoeRuntime candidatos={candidatos} enabled />)

    fireEvent.keyDown(window, evento)

    expect(acionarTarefa).toHaveBeenCalledOnce()
    expect(acionarSelah).not.toHaveBeenCalled()
    expect(acionarPortal).not.toHaveBeenCalled()
  })

  it('ignora key-repeat', () => {
    const { candidatos, acionarTarefa } = criarCandidatos()
    render(<InteracaoNoeRuntime candidatos={candidatos} enabled />)

    fireEvent.keyDown(window, { code: 'KeyE', repeat: true })

    expect(acionarTarefa).not.toHaveBeenCalled()
  })

  it('preserva Enter originado em controle do HUD', () => {
    const { candidatos, acionarTarefa } = criarCandidatos()
    render(<InteracaoNoeRuntime candidatos={candidatos} enabled />)
    const botaoHud = document.createElement('button')
    document.body.append(botaoHud)

    fireEvent.keyDown(botaoHud, { key: 'Enter' })

    expect(acionarTarefa).not.toHaveBeenCalled()
    botaoHud.remove()
  })

  it('ignora evento já consumido', () => {
    const { candidatos, acionarTarefa } = criarCandidatos()
    render(<InteracaoNoeRuntime candidatos={candidatos} enabled />)
    const evento = new KeyboardEvent('keydown', {
      code: 'KeyE',
      bubbles: true,
      cancelable: true,
    })
    evento.preventDefault()

    window.dispatchEvent(evento)

    expect(acionarTarefa).not.toHaveBeenCalled()
  })

  it('não aciona quando disabled', () => {
    const { candidatos, acionarTarefa } = criarCandidatos()
    render(<InteracaoNoeRuntime candidatos={candidatos} enabled={false} />)

    fireEvent.keyDown(window, { code: 'KeyE' })

    expect(acionarTarefa).not.toHaveBeenCalled()
  })

  it('remove o listener no unmount', () => {
    const { candidatos, acionarTarefa } = criarCandidatos()
    const { unmount } = render(
      <InteracaoNoeRuntime candidatos={candidatos} enabled />,
    )

    unmount()
    fireEvent.keyDown(window, { code: 'KeyE' })

    expect(acionarTarefa).not.toHaveBeenCalled()
  })

  it('confirma a lista mais recente logo após um rerender', () => {
    const antigos = criarCandidatos()
    const novos = criarCandidatos()
    const { rerender } = render(
      <InteracaoNoeRuntime candidatos={antigos.candidatos} enabled />,
    )

    rerender(<InteracaoNoeRuntime candidatos={novos.candidatos} enabled />)
    fireEvent.keyDown(window, { code: 'KeyE' })

    expect(novos.acionarTarefa).toHaveBeenCalledOnce()
    expect(antigos.acionarTarefa).not.toHaveBeenCalled()
  })

  it('consome a confirmação antes de listeners posteriores', () => {
    const { candidatos, acionarTarefa } = criarCandidatos()
    const listenerPosterior = vi.fn()
    render(<InteracaoNoeRuntime candidatos={candidatos} enabled />)
    window.addEventListener('keydown', listenerPosterior, { once: true })

    fireEvent.keyDown(window, { code: 'KeyE' })

    expect(acionarTarefa).toHaveBeenCalledOnce()
    expect(listenerPosterior).not.toHaveBeenCalled()
    window.removeEventListener('keydown', listenerPosterior)
  })
})
