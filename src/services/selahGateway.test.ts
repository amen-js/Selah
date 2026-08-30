import type { EventoMetrica } from '../types/selah'
import { createSelahGateway } from './selahGateway'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })

describe('selahGateway', () => {
  it('loads a verse with encoded query parameters', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      jsonResponse({
        passagemId: 'genesis-1-3',
        referencia: 'Gênesis 1:3',
        texto: 'Haja luz.',
        idioma: 'pt-BR',
        versao: 'NVI',
        atribuicao: 'Licenciado para a demo.',
      }),
    )
    const gateway = createSelahGateway({ baseUrl: 'http://localhost:8787/', fetchFn })

    await expect(
      gateway.buscarVersiculo(
        { historiaId: 'criacao', passagemId: 'genesis 1:3' },
        'pt-BR',
      ),
    ).resolves.toMatchObject({ referencia: 'Gênesis 1:3', texto: 'Haja luz.' })
    expect(fetchFn).toHaveBeenCalledWith(
      'http://localhost:8787/api/versiculo?passagemId=genesis+1%3A3&idioma=pt-BR',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('sanitizes the generated quiz and never exposes an answer key', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      jsonResponse({
        id: 'quiz-1',
        passagemId: 'genesis-1-3',
        pergunta: 'O que foi criado?',
        alternativas: [
          { id: 'A', texto: 'A luz' },
          { id: 'B', texto: 'A arca' },
          { id: 'C', texto: 'O palácio' },
          { id: 'D', texto: 'A cidade' },
        ],
        origem: 'ia',
        respostaCorretaId: 'A',
        explicacao: 'Campo que não pode chegar à UI.',
      }),
    )
    const gateway = createSelahGateway({ fetchFn })

    const result = await gateway.gerarQuiz({
      historiaId: 'criacao',
      passagemId: 'genesis-1-3',
      idioma: 'pt-BR',
      faixaEtaria: 'crianca',
      dificuldade: 'facil',
      iaAtiva: true,
    })

    expect(result).toEqual({
      id: 'quiz-1',
      passagemId: 'genesis-1-3',
      pergunta: 'O que foi criado?',
      alternativas: [
        { id: 'A', texto: 'A luz' },
        { id: 'B', texto: 'A arca' },
        { id: 'C', texto: 'O palácio' },
        { id: 'D', texto: 'A cidade' },
      ],
      origem: 'ia',
    })
    expect(result).not.toHaveProperty('respostaCorretaId')
  })

  it('rejects malformed quizzes instead of rendering them', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      jsonResponse({
        id: 'quiz-1',
        passagemId: 'genesis-1-3',
        pergunta: 'Pergunta incompleta',
        alternativas: [{ id: 'A', texto: 'Única opção' }],
        origem: 'ia',
      }),
    )

    await expect(
      createSelahGateway({ fetchFn }).gerarQuiz({
        historiaId: 'criacao',
        passagemId: 'genesis-1-3',
        idioma: 'pt-BR',
        faixaEtaria: 'geral',
        dificuldade: 'medio',
        iaAtiva: true,
      }),
    ).rejects.toThrow('quiz válido')
  })

  it('submits only the quiz and selected alternative for evaluation', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      jsonResponse({
        acertou: true,
        explicacao: 'A resposta está sustentada pelo texto.',
        referencia: 'Gênesis 1:3',
      }),
    )
    const gateway = createSelahGateway({ fetchFn })

    await gateway.responderQuiz({ quizId: 'quiz-1', alternativaId: 'A' })

    expect(fetchFn).toHaveBeenCalledWith(
      '/api/quiz/responder',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ quizId: 'quiz-1', alternativaId: 'A' }),
      }),
    )
  })

  it('sends minimal metrics only after consent', async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    const gateway = createSelahGateway({ fetchFn })
    const eventos: EventoMetrica[] = [
      { tipo: 'selah_iniciado', historiaId: 'criacao', versaoApp: '0.0.0' },
    ]

    await gateway.enviarMetricas(eventos, false)
    expect(fetchFn).not.toHaveBeenCalled()

    await gateway.enviarMetricas(eventos, true)
    expect(fetchFn).toHaveBeenCalledOnce()
    expect(fetchFn).toHaveBeenCalledWith(
      '/api/metricas/eventos',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ eventos }),
      }),
    )
  })
})
