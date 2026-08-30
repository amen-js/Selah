import { describe, expect, it } from 'vitest'
import { momentoNoePorId } from '../progression/catalogo'
import type { ProgressoAcaoNoe } from '../progression/types'
import {
  campoAnimaisNoeVisivel,
  descreverEstadoCampoAnimaisNoe,
  gruposConducaoAnimaisNoe,
  interpolarCaminhoGrupoAnimaisNoe,
  resolverCandidatoCampoAnimaisNoe,
} from './animais'

describe('condução de famílias de animais em M4', () => {
  it('espelha exatamente as três unidades allowlisted do catálogo', () => {
    const catalogo = momentoNoePorId.get('conducao-animais')
    const esperadas =
      catalogo?.gatilhoConclusao.tarefas.flatMap((tarefa) =>
        tarefa.unidadesNecessarias.map(
          (unidadeId) => `${tarefa.acaoId}:${unidadeId}`,
        ),
      ) ?? []
    const descritas = gruposConducaoAnimaisNoe.map(
      ({ acaoId, unidadeId }) => `${acaoId}:${unidadeId}`,
    )

    expect(descritas).toEqual(esperadas)
    expect(descritas).toEqual([
      'noe.animais.aves-guiadas:aves-trilha-sementes',
      'noe.animais.herbivoros-guiados:grandes-herbivoros-ponte-alinhada',
      'noe.animais.mamiferos-guiados:pequenos-mamiferos-cestos',
    ])
  })

  it('modela sempre grupos e nunca um animal individual', () => {
    expect(gruposConducaoAnimaisNoe).toHaveLength(3)
    expect(
      gruposConducaoAnimaisNoe.every(({ especies }) => especies.length >= 2),
    ).toBe(true)
    expect(
      gruposConducaoAnimaisNoe.map(({ comportamento }) => comportamento),
    ).toEqual(['trilha-sementes', 'ponte-alinhada', 'cestos'])
    expect(
      gruposConducaoAnimaisNoe.every(({ caminho }) => caminho.length >= 5),
    ).toBe(true)
  })

  it('faz as famílias percorrerem a rota comportamental inteira', () => {
    const caminho = gruposConducaoAnimaisNoe[1].caminho

    expect(interpolarCaminhoGrupoAnimaisNoe(caminho, -1)).toEqual(caminho[0])
    expect(interpolarCaminhoGrupoAnimaisNoe(caminho, 1)).toEqual(
      caminho[caminho.length - 1],
    )
    expect(interpolarCaminhoGrupoAnimaisNoe(caminho, 0.5)).toEqual(caminho[2])
  })

  it('mantém a chegada visível em M5, mas candidatos somente durante M4', () => {
    const aves = gruposConducaoAnimaisNoe[0]
    const jogador = {
      x: aves.posicaoInteracao[0],
      y: aves.posicaoInteracao[1],
      z: aves.posicaoInteracao[2],
    }

    expect(campoAnimaisNoeVisivel('estoque-mantimentos')).toBe(false)
    expect(campoAnimaisNoeVisivel('conducao-animais')).toBe(true)
    expect(campoAnimaisNoeVisivel('acomodacao-animais')).toBe(true)
    expect(campoAnimaisNoeVisivel('fechamento-porta')).toBe(false)
    expect(
      resolverCandidatoCampoAnimaisNoe(
        jogador,
        'estoque-mantimentos',
        [],
      ),
    ).toBeNull()
    expect(
      resolverCandidatoCampoAnimaisNoe(jogador, 'conducao-animais', []),
    ).toMatchObject({
      tipo: 'tarefa',
      acaoId: 'noe.animais.aves-guiadas',
      unidadeId: 'aves-trilha-sementes',
      comportamento: 'trilha-sementes',
    })
    expect(
      resolverCandidatoCampoAnimaisNoe(
        jogador,
        'acomodacao-animais',
        [],
      ),
    ).toBeNull()
  })

  it('retira a família concluída sem bloquear os outros grupos livres', () => {
    const progresso: readonly ProgressoAcaoNoe[] = [
      {
        acaoId: 'noe.animais.aves-guiadas',
        unidadesConcluidas: ['aves-trilha-sementes'],
      },
    ]
    const estados = descreverEstadoCampoAnimaisNoe(
      'conducao-animais',
      progresso,
    )
    expect(
      estados.map(({ descritor, concluido, disponivel }) => ({
        id: descritor.id,
        concluido,
        disponivel,
      })),
    ).toEqual([
      { id: 'aves', concluido: true, disponivel: false },
      { id: 'grandes-herbivoros', concluido: false, disponivel: true },
      { id: 'pequenos-mamiferos', concluido: false, disponivel: true },
    ])

    const aves = gruposConducaoAnimaisNoe[0]
    expect(
      resolverCandidatoCampoAnimaisNoe(
        {
          x: aves.posicaoInteracao[0],
          y: aves.posicaoInteracao[1],
          z: aves.posicaoInteracao[2],
        },
        'conducao-animais',
        progresso,
      ),
    ).toBeNull()
  })

  it('reconstrói a conclusão depois do avanço, sem depender do checkpoint limpo', () => {
    const antes = descreverEstadoCampoAnimaisNoe(
      'estoque-mantimentos',
      [
        {
          acaoId: 'noe.animais.aves-guiadas',
          unidadesConcluidas: ['aves-trilha-sementes'],
        },
      ],
    )
    const depois = descreverEstadoCampoAnimaisNoe(
      'acomodacao-animais',
      [],
    )

    expect(antes.every(({ concluido }) => !concluido)).toBe(true)
    expect(depois.every(({ concluido }) => concluido)).toBe(true)
    expect(depois.every(({ disponivel }) => !disponivel)).toBe(true)
  })
})
