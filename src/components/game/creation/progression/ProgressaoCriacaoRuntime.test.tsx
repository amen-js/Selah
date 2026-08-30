import { act, fireEvent, render } from '@testing-library/react'
import type { RefObject } from 'react'
import { useGameStore } from '../../../../stores/gameStore'
import type { PosicaoJogador } from '../proximidade'
import { ProgressaoCriacaoRuntime } from './ProgressaoCriacaoRuntime'

const frameMock = vi.hoisted(() => ({ callbacks: [] as unknown[] }))

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: unknown) => frameMock.callbacks.push(callback),
}))

function executarUltimoFrame() {
  const callback = frameMock.callbacks.at(-1) as (
    estado: unknown,
    delta: number,
  ) => void
  callback({}, 1 / 60)
}

describe('ProgressaoCriacaoRuntime', () => {
  const posicaoJogadorRef: RefObject<PosicaoJogador | null> = {
    current: { x: 0, y: 0, z: 0 },
  }

  beforeEach(() => {
    frameMock.callbacks.length = 0
    posicaoJogadorRef.current = { x: 0, y: 0, z: 0 }
    useGameStore.getState().apagarProgresso()
  })

  it('não transforma resposta de quiz em conclusão de Selah', () => {
    useGameStore.setState({
      momentosCriacaoConcluidos: ['vazio'],
      historico: [
        {
          quizId: 'quiz-light',
          passagemId: 'genesis-1-3',
          alternativaId: 'A',
          acertou: true,
        },
      ],
      selahsConcluidos: [],
    })
    const onMomentoChange = vi.fn()

    render(
      <ProgressaoCriacaoRuntime
        posicaoJogadorRef={posicaoJogadorRef}
        enabled
        onMomentoChange={onMomentoChange}
      />,
    )

    expect(onMomentoChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'luz' }),
      expect.objectContaining({ momentoAtualId: 'luz' }),
    )
  })

  it('aplica um Selah concluído somente quando a exploração volta a ficar ativa', () => {
    useGameStore.setState({
      momentosCriacaoConcluidos: ['vazio'],
      selahsConcluidos: [],
    })
    const onMomentoChange = vi.fn()
    const { rerender } = render(
      <ProgressaoCriacaoRuntime
        posicaoJogadorRef={posicaoJogadorRef}
        enabled={false}
        onMomentoChange={onMomentoChange}
      />,
    )

    act(() => {
      useGameStore.setState({ selahsConcluidos: ['genesis-1-3'] })
    })
    expect(onMomentoChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'luz' }),
      expect.objectContaining({ momentoAtualId: 'luz' }),
    )

    rerender(
      <ProgressaoCriacaoRuntime
        posicaoJogadorRef={posicaoJogadorRef}
        enabled
        onMomentoChange={onMomentoChange}
      />,
    )

    expect(onMomentoChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'ceu-terra-aguas' }),
      expect.objectContaining({ momentoAtualId: 'ceu-terra-aguas' }),
    )
    expect(useGameStore.getState().momentosCriacaoConcluidos).toEqual([
      'vazio',
      'luz',
    ])
  })

  it('só conclui uma zona próxima depois de E ou Enter', () => {
    useGameStore.setState({
      momentosCriacaoConcluidos: ['vazio', 'luz'],
      selahsConcluidos: ['genesis-1-3'],
    })
    posicaoJogadorRef.current = { x: -14, y: 2.5, z: 5 }
    const onMomentoChange = vi.fn()
    const onObjetivoProximo = vi.fn()

    render(
      <ProgressaoCriacaoRuntime
        posicaoJogadorRef={posicaoJogadorRef}
        enabled
        onMomentoChange={onMomentoChange}
        onObjetivoProximo={onObjetivoProximo}
      />,
    )
    act(executarUltimoFrame)

    expect(onObjetivoProximo).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'mirante-dos-rios' }),
    )
    expect(useGameStore.getState().momentosCriacaoConcluidos).toEqual([
      'vazio',
      'luz',
    ])

    fireEvent.keyDown(window, { code: 'KeyE', repeat: true })
    expect(useGameStore.getState().momentosCriacaoConcluidos).toHaveLength(2)

    fireEvent.keyDown(window, { code: 'Enter' })
    expect(onMomentoChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'natureza' }),
      expect.objectContaining({ momentoAtualId: 'natureza' }),
    )
    expect(useGameStore.getState().momentosCriacaoConcluidos).toEqual([
      'vazio',
      'luz',
      'ceu-terra-aguas',
    ])
  })

  it('consome a confirmação da zona antes de outros listeners globais', () => {
    useGameStore.setState({
      momentosCriacaoConcluidos: ['vazio', 'luz'],
      selahsConcluidos: ['genesis-1-3'],
    })
    posicaoJogadorRef.current = { x: -14, y: 2.5, z: 5 }
    const onPortalAcionado = vi.fn()
    render(
      <ProgressaoCriacaoRuntime
        posicaoJogadorRef={posicaoJogadorRef}
        enabled
      />,
    )
    window.addEventListener('keydown', onPortalAcionado, { once: true })

    act(executarUltimoFrame)
    fireEvent.keyDown(window, { code: 'Enter' })

    expect(useGameStore.getState().momentosCriacaoConcluidos).toContain(
      'ceu-terra-aguas',
    )
    expect(onPortalAcionado).not.toHaveBeenCalled()
    window.removeEventListener('keydown', onPortalAcionado)
  })

  it('não avança a zona com Enter originado em controle do HUD', () => {
    useGameStore.setState({
      momentosCriacaoConcluidos: ['vazio', 'luz'],
      selahsConcluidos: ['genesis-1-3'],
    })
    posicaoJogadorRef.current = { x: -14, y: 2.5, z: 5 }
    render(
      <ProgressaoCriacaoRuntime
        posicaoJogadorRef={posicaoJogadorRef}
        enabled
      />,
    )
    const seletorIdioma = document.createElement('select')
    document.body.append(seletorIdioma)

    act(executarUltimoFrame)
    fireEvent.keyDown(seletorIdioma, { key: 'Enter' })

    expect(useGameStore.getState().momentosCriacaoConcluidos).toEqual([
      'vazio',
      'luz',
    ])
    seletorIdioma.remove()
  })

  it('restaura 9/9, não reabre o objetivo final e reage ao reset', () => {
    const todos = [
      'vazio',
      'luz',
      'ceu-terra-aguas',
      'natureza',
      'ceu-ritmo',
      'criaturas',
      'eden',
      'adao-e-eva',
      'fruto-escolha',
    ]
    useGameStore.setState({ momentosCriacaoConcluidos: todos })
    posicaoJogadorRef.current = { x: 12, y: 1, z: -12 }
    const onMomentoChange = vi.fn()
    const onObjetivoProximo = vi.fn()

    render(
      <ProgressaoCriacaoRuntime
        posicaoJogadorRef={posicaoJogadorRef}
        enabled
        onMomentoChange={onMomentoChange}
        onObjetivoProximo={onObjetivoProximo}
      />,
    )
    act(executarUltimoFrame)

    expect(onMomentoChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'fruto-escolha' }),
      expect.objectContaining({ concluida: true }),
    )
    expect(onObjetivoProximo).not.toHaveBeenCalledWith(
      expect.objectContaining({ id: 'arvore-do-conhecimento' }),
    )

    act(() => useGameStore.getState().apagarProgresso())
    expect(onMomentoChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'vazio' }),
      expect.objectContaining({
        momentoAtualId: 'vazio',
        momentosConcluidos: [],
        concluida: false,
      }),
    )
  })
})
