import type { CheckpointProgressaoNoe } from '../progression'
import { obterSpawnNoe, SPAWN_INTERIOR_ARCA_NOE } from './spawn'

const SPAWN_NOVA_TERRA = [0, 1.2, 32] as const

function checkpoint(
  momentosConcluidos: readonly string[],
  progressoMomentoAtual: CheckpointProgressaoNoe['progressoMomentoAtual'] = [],
): CheckpointProgressaoNoe {
  return { versao: 1, momentosConcluidos, progressoMomentoAtual }
}

const ATE_M5 = [
  'chamado-canteiro',
  'coleta-vedacao',
  'estoque-mantimentos',
  'conducao-animais',
  'acomodacao-animais',
] as const

const M6_CONCLUIDO = [
  {
    acaoId: 'noe.abrigo.chamado-ouvido',
    unidadesConcluidas: ['chamado-final-noe'],
  },
  {
    acaoId: 'noe.abrigo.entrada-concluida',
    unidadesConcluidas: ['entrada-segura-na-arca'],
  },
  {
    acaoId: 'noe.porta.fechada',
    unidadesConcluidas: ['porta-da-arca-fechada'],
  },
] as const

describe('spawn de reentrada em Noé', () => {
  it('mantém o spawn padrão antes de a porta fechar', () => {
    expect(obterSpawnNoe(null, SPAWN_NOVA_TERRA)).toBe(SPAWN_NOVA_TERRA)
    expect(
      obterSpawnNoe(checkpoint(ATE_M5), SPAWN_NOVA_TERRA),
    ).toBe(SPAWN_NOVA_TERRA)
  })

  it('restaura dentro da Arca enquanto M6 aguarda o Selah', () => {
    expect(
      obterSpawnNoe(
        checkpoint(ATE_M5, M6_CONCLUIDO),
        SPAWN_NOVA_TERRA,
      ),
    ).toBe(SPAWN_INTERIOR_ARCA_NOE)
  })

  it.each([
    ['M7', [...ATE_M5, 'fechamento-porta']],
    [
      'M8',
      [...ATE_M5, 'fechamento-porta', 'refugio-tempestade'],
    ],
  ])('restaura dentro da Arca durante %s', (_nome, concluidos) => {
    expect(
      obterSpawnNoe(checkpoint(concluidos), SPAWN_NOVA_TERRA),
    ).toBe(SPAWN_INTERIOR_ARCA_NOE)
  })

  it('volta ao spawn externo quando a porta abre em M9', () => {
    const ateM8 = [
      ...ATE_M5,
      'fechamento-porta',
      'refugio-tempestade',
      'retorno-pomba',
    ]

    expect(
      obterSpawnNoe(checkpoint(ateM8), SPAWN_NOVA_TERRA),
    ).toBe(SPAWN_NOVA_TERRA)
    expect(
      obterSpawnNoe(
        checkpoint([...ateM8, 'nova-terra-arco-iris']),
        SPAWN_NOVA_TERRA,
      ),
    ).toBe(SPAWN_NOVA_TERRA)
  })
})
