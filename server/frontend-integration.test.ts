// @vitest-environment node
import { mapaCriacao } from '../src/mapas/criacao.ts'
import { createSelahGateway } from '../src/services/selahGateway.ts'
import { createApp } from './app.ts'
import { loadEnv } from './env.ts'

const createAppFetch = (): typeof fetch => {
  const env = {
    ...loadEnv(),
    openRouterApiKey: '',
    youVersionAppKey: '',
  }
  const app = createApp({ env, openRouter: null })

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
})
