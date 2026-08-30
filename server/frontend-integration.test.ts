// @vitest-environment node
import { mapaCriacao } from '../src/mapas/criacao.ts'
import { createSelahGateway } from '../src/services/selahGateway.ts'
import { createApp } from './app.ts'
import { loadEnv } from './env.ts'
import type { OpenRouterClient } from './services/openrouter.ts'

const createAppFetch = (openRouter: OpenRouterClient | null = null): typeof fetch => {
  const env = {
    ...loadEnv(),
    openRouterApiKey: '',
    youVersionAppKey: '',
  }
  const app = createApp({ env, openRouter })

  return (input, init) => {
    const request = input instanceof Request ? input : new Request(input, init)
    return app.fetch(request)
  }
}

describe('Dev 2 frontend integration', () => {
  it('serves every Creation collectible through the real gateway contract', async () => {
    const gateway = createSelahGateway({
      baseUrl: 'http://selah.test',
      fetchFn: createAppFetch(),
    })

    for (const gatilho of mapaCriacao.coletaveis) {
      const versiculo = await gateway.buscarVersiculo(gatilho, 'pt-BR')
      expect(versiculo.passagemId).toBe(gatilho.passagemId)
      expect(versiculo.texto).not.toBe('')

      const quiz = await gateway.gerarQuiz({
        historiaId: gatilho.historiaId,
        passagemId: gatilho.passagemId,
        idioma: 'pt-BR',
        faixaEtaria: 'crianca',
        dificuldade: 'facil',
        iaAtiva: false,
      })
      expect(quiz.passagemId).toBe(gatilho.passagemId)
      expect(quiz.alternativas).toHaveLength(4)
      expect(quiz).not.toHaveProperty('respostaCorretaId')
      expect(quiz).not.toHaveProperty('explicacao')

      const avaliacao = await gateway.responderQuiz({
        quizId: quiz.id,
        alternativaId: 'A',
      })
      expect(avaliacao).toEqual({
        acertou: expect.any(Boolean),
        explicacao: expect.any(String),
        referencia: versiculo.referencia,
      })
    }
  })

  it('completes an AI quiz from a real Creation collectible through the public gateway', async () => {
    const gatilho = mapaCriacao.coletaveis.find(
      ({ passagemId }) => passagemId === 'genesis-1-3',
    )
    expect(gatilho).toBeDefined()

    const gerarQuiz = vi.fn<OpenRouterClient['gerarQuiz']>().mockResolvedValue({
      pergunta: 'O que Deus disse para que houvesse luz?',
      alternativas: [
        { id: 'A', texto: 'Haja luz' },
        { id: 'B', texto: 'Haja uma cidade' },
        { id: 'C', texto: 'Haja um palácio' },
        { id: 'D', texto: 'Haja uma torre' },
      ],
      respostaCorretaId: 'A',
      explicacao: 'Deus disse haja luz e houve luz.',
    })
    const gateway = createSelahGateway({
      baseUrl: 'http://selah.test',
      fetchFn: createAppFetch({ gerarQuiz }),
    })
    const versiculo = await gateway.buscarVersiculo(gatilho!, 'pt-BR')
    expect(versiculo).toMatchObject({
      passagemId: gatilho!.passagemId,
      referencia: 'Gênesis 1:3',
      texto: 'E disse Deus: Haja luz. E houve luz.',
    })

    const quiz = await gateway.gerarQuiz({
      historiaId: gatilho!.historiaId,
      passagemId: gatilho!.passagemId,
      idioma: 'pt-BR',
      faixaEtaria: 'crianca',
      dificuldade: 'facil',
      iaAtiva: true,
    })

    expect(gerarQuiz).toHaveBeenCalledOnce()
    expect(gerarQuiz).toHaveBeenCalledWith({
      referencia: 'Gênesis 1:3',
      texto: 'E disse Deus: Haja luz. E houve luz.',
      idioma: 'pt-BR',
      faixaEtaria: 'crianca',
      dificuldade: 'facil',
    })
    expect(quiz).toEqual({
      id: expect.stringMatching(/^quiz-/),
      passagemId: gatilho!.passagemId,
      pergunta: 'O que Deus disse para que houvesse luz?',
      alternativas: expect.any(Array),
      origem: 'ia',
    })
    expect(quiz.alternativas.map((item) => item.id)).toEqual(['A', 'B', 'C', 'D'])
    expect(quiz.alternativas.map((item) => item.texto).sort()).toEqual(
      ['Haja luz', 'Haja um palácio', 'Haja uma cidade', 'Haja uma torre'].sort(),
    )
    expect(quiz).not.toHaveProperty('respostaCorretaId')
    expect(quiz).not.toHaveProperty('explicacao')

    const correta = quiz.alternativas.find((item) => item.texto === 'Haja luz')
    expect(correta?.id).toBeDefined()
    await expect(
      gateway.responderQuiz({ quizId: quiz.id, alternativaId: correta!.id }),
    ).resolves.toEqual({
      acertou: true,
      explicacao: 'Deus disse haja luz e houve luz.',
      referencia: versiculo.referencia,
    })
  })
})
