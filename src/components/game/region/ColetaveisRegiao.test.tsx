import { act, fireEvent, render } from '@testing-library/react'
import type { ColetavelMapa } from '../../../mapas/types'
import { useGameStore } from '../../../stores/gameStore'
import type { PosicaoJogador } from '../creation/proximidade'
import { ColetaveisRegiao } from './ColetaveisRegiao'

const frameMock = vi.hoisted(() => ({ callbacks: [] as unknown[] }))

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: unknown) => frameMock.callbacks.push(callback),
}))

const coletaveis: readonly ColetavelMapa[] = [
  {
    id: 'distante',
    historiaId: 'criacao',
    passagemId: 'genesis-1-3',
    posicao: [1.2, 0, 0],
    raioAtivacao: 2,
  },
  {
    id: 'proximo',
    historiaId: 'criacao',
    passagemId: 'genesis-1-11',
    posicao: [0.4, 0, 0],
    raioAtivacao: 2,
  },
]

function executarFrameDeInteracao() {
  const callback = frameMock.callbacks[0] as (
    estado: unknown,
    delta: number,
  ) => void
  callback({}, 1 / 60)
}

describe('ColetaveisRegiao', () => {
  const posicaoJogadorRef: { current: PosicaoJogador | null } = {
    current: { x: 0, y: 0, z: 0 },
  }

  beforeEach(() => {
    frameMock.callbacks.length = 0
    posicaoJogadorRef.current = { x: 0, y: 0, z: 0 }
    useGameStore.getState().apagarProgresso()
  })

  it('preserva o acionamento automático por padrão e escolhe o mais próximo', () => {
    render(
      <ColetaveisRegiao
        coletaveis={coletaveis}
        posicaoJogadorRef={posicaoJogadorRef}
        enabled
      />,
    )

    act(executarFrameDeInteracao)

    expect(useGameStore.getState().selahAtivo?.gatilho.passagemId).toBe(
      'genesis-1-11',
    )
  })

  it('preserva o bloqueio legado por histórico fora da Criação', () => {
    useGameStore.setState({
      historico: [
        {
          quizId: 'quiz-legacy',
          passagemId: 'genesis-1-11',
          alternativaId: 'A',
          acertou: true,
        },
      ],
      selahsConcluidos: [],
    })
    render(
      <ColetaveisRegiao
        coletaveis={[coletaveis[1]]}
        posicaoJogadorRef={posicaoJogadorRef}
        enabled
      />,
    )

    act(executarFrameDeInteracao)
    expect(useGameStore.getState().selahAtivo).toBeNull()
  })

  it('permite à Criação refazer uma resposta cujo Selah não foi concluído', () => {
    useGameStore.setState({
      historico: [
        {
          quizId: 'quiz-feedback-reload',
          passagemId: 'genesis-1-11',
          alternativaId: 'A',
          acertou: true,
        },
      ],
      selahsConcluidos: [],
    })
    render(
      <ColetaveisRegiao
        coletaveis={[coletaveis[1]]}
        posicaoJogadorRef={posicaoJogadorRef}
        enabled
        interacaoExplicita
        bloquearPassagensRespondidas={false}
      />,
    )

    act(executarFrameDeInteracao)
    fireEvent.keyDown(window, { code: 'KeyE' })
    expect(useGameStore.getState().selahAtivo?.gatilho.passagemId).toBe(
      'genesis-1-11',
    )
  })

  it('em modo explícito apenas notifica até receber E ou Enter sem repeat', () => {
    const onColetavelProximo = vi.fn()
    render(
      <ColetaveisRegiao
        coletaveis={coletaveis}
        posicaoJogadorRef={posicaoJogadorRef}
        enabled
        interacaoExplicita
        onColetavelProximo={onColetavelProximo}
      />,
    )

    act(executarFrameDeInteracao)
    expect(onColetavelProximo).toHaveBeenLastCalledWith(coletaveis[1])
    expect(useGameStore.getState().selahAtivo).toBeNull()

    fireEvent.keyDown(window, { code: 'KeyE', repeat: true })
    expect(useGameStore.getState().selahAtivo).toBeNull()

    fireEvent.keyDown(window, { code: 'Enter', repeat: false })
    expect(useGameStore.getState().selahAtivo?.gatilho.passagemId).toBe(
      'genesis-1-11',
    )
    expect(onColetavelProximo).toHaveBeenLastCalledWith(null)
  })

  it('consome a confirmação para não acionar portal no mesmo evento', () => {
    const onPortalAcionado = vi.fn()
    render(
      <ColetaveisRegiao
        coletaveis={[coletaveis[1]]}
        posicaoJogadorRef={posicaoJogadorRef}
        enabled
        interacaoExplicita
      />,
    )
    window.addEventListener('keydown', onPortalAcionado, { once: true })

    act(executarFrameDeInteracao)
    fireEvent.keyDown(window, { code: 'KeyE' })

    expect(useGameStore.getState().selahAtivo).not.toBeNull()
    expect(onPortalAcionado).not.toHaveBeenCalled()
    window.removeEventListener('keydown', onPortalAcionado)
  })

  it('rearma cancelamento só depois de sair e não reabre Selah concluído', () => {
    render(
      <ColetaveisRegiao
        coletaveis={[coletaveis[1]]}
        posicaoJogadorRef={posicaoJogadorRef}
        enabled
        interacaoExplicita
      />,
    )

    act(executarFrameDeInteracao)
    fireEvent.keyDown(window, { code: 'KeyE' })
    expect(useGameStore.getState().selahAtivo).not.toBeNull()

    act(() => useGameStore.getState().cancelarSelah())
    fireEvent.keyDown(window, { code: 'KeyE' })
    expect(useGameStore.getState().selahAtivo).toBeNull()

    posicaoJogadorRef.current = { x: 5, y: 0, z: 0 }
    act(executarFrameDeInteracao)
    posicaoJogadorRef.current = { x: 0, y: 0, z: 0 }
    act(executarFrameDeInteracao)
    fireEvent.keyDown(window, { code: 'KeyE' })
    expect(useGameStore.getState().selahAtivo).not.toBeNull()

    act(() => {
      useGameStore.setState({
        selahAtivo: null,
        selahsConcluidos: ['genesis-1-11'],
      })
    })
    posicaoJogadorRef.current = { x: 5, y: 0, z: 0 }
    act(executarFrameDeInteracao)
    posicaoJogadorRef.current = { x: 0, y: 0, z: 0 }
    act(executarFrameDeInteracao)
    fireEvent.keyDown(window, { code: 'KeyE' })
    expect(useGameStore.getState().selahAtivo).toBeNull()
  })
})
