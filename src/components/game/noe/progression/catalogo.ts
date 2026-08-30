import type { MomentoNoe } from './types'

/**
 * Approved World 2 route. The five Selahs intentionally reuse the passages
 * already accepted by the proxy; all remaining beats are local actions.
 */
export const momentosNoe: readonly MomentoNoe[] = [
  {
    id: 'chamado-canteiro',
    ordem: 1,
    titulo: 'O chamado e o canteiro',
    areaId: 'canteiro-vale',
    faseCenario: 'vale-calmo',
    gatilhoConclusao: {
      tipo: 'tarefas-locais-e-selah-opcional',
      tarefas: [
        {
          acaoId: 'noe.chamado.confirmado',
          unidadesNecessarias: ['chamado-noe'],
        },
      ],
    },
  },
  {
    id: 'coleta-vedacao',
    ordem: 2,
    titulo: 'A coleta e a vedação',
    areaId: 'canteiro-vale',
    faseCenario: 'canteiro-preparado',
    gatilhoConclusao: {
      tipo: 'tarefas-locais-e-selah-opcional',
      tarefas: [
        {
          acaoId: 'noe.madeira.coletada',
          unidadesNecessarias: ['tabua-1', 'tabua-2', 'tabua-3', 'tabua-4'],
        },
        {
          acaoId: 'noe.rampa.reparada',
          unidadesNecessarias: ['rampa-principal'],
        },
        {
          acaoId: 'noe.betume.aplicado',
          unidadesNecessarias: ['fenda-casco-1', 'fenda-casco-2', 'fenda-casco-3'],
        },
      ],
      selahFinal: 'genesis-6-14',
    },
  },
  {
    id: 'estoque-mantimentos',
    ordem: 3,
    titulo: 'O estoque de mantimentos',
    areaId: 'interior-arca',
    faseCenario: 'estoque-organizado',
    gatilhoConclusao: {
      tipo: 'tarefas-locais-e-selah-opcional',
      tarefas: [
        {
          acaoId: 'noe.estoque.organizado',
          unidadesNecessarias: ['estoque-principal'],
        },
      ],
    },
  },
  {
    id: 'conducao-animais',
    ordem: 4,
    titulo: 'A chegada dos animais',
    areaId: 'campo-animais',
    faseCenario: 'campo-das-familias',
    gatilhoConclusao: {
      tipo: 'tarefas-locais-e-selah-opcional',
      tarefas: [
        {
          acaoId: 'noe.familias.guiadas',
          unidadesNecessarias: ['familias-do-campo'],
        },
      ],
    },
  },
  {
    id: 'acomodacao-animais',
    ordem: 5,
    titulo: 'A acomodação e o Selah',
    areaId: 'interior-arca',
    faseCenario: 'arca-acolhedora',
    gatilhoConclusao: {
      tipo: 'tarefas-locais-e-selah-opcional',
      tarefas: [
        {
          acaoId: 'noe.habitats.organizados',
          unidadesNecessarias: ['habitats-da-arca'],
        },
      ],
      selahFinal: 'genesis-6-19',
    },
  },
  {
    id: 'fechamento-porta',
    ordem: 6,
    titulo: 'O fechamento da porta',
    areaId: 'canteiro-vale',
    faseCenario: 'porta-fechada',
    gatilhoConclusao: {
      tipo: 'tarefas-locais-e-selah-opcional',
      tarefas: [
        {
          acaoId: 'noe.porta.atravessada',
          unidadesNecessarias: ['entrada-segura'],
        },
      ],
      selahFinal: 'genesis-7-1',
    },
  },
  {
    id: 'refugio-tempestade',
    ordem: 7,
    titulo: 'O refúgio na tempestade',
    areaId: 'interior-arca',
    faseCenario: 'refugio-seguro',
    gatilhoConclusao: {
      tipo: 'tarefas-locais-e-selah-opcional',
      tarefas: [
        {
          acaoId: 'noe.filhotes.cuidados',
          unidadesNecessarias: ['cuidado-dos-filhotes'],
        },
      ],
      selahFinal: 'genesis-8-1',
    },
  },
  {
    id: 'retorno-pomba',
    ordem: 8,
    titulo: 'O retorno da pomba',
    areaId: 'interior-arca',
    faseCenario: 'esperanca-retornando',
    gatilhoConclusao: {
      tipo: 'tarefas-locais-e-selah-opcional',
      tarefas: [
        {
          acaoId: 'noe.pomba.retornou',
          unidadesNecessarias: ['retorno-com-oliveira'],
        },
      ],
    },
  },
  {
    id: 'nova-terra-arco-iris',
    ordem: 9,
    titulo: 'A nova terra e o arco-íris',
    areaId: 'ararate-nova-terra',
    faseCenario: 'nova-alianca',
    gatilhoConclusao: {
      tipo: 'tarefas-locais-e-selah-opcional',
      tarefas: [
        {
          acaoId: 'noe.animais.desembarcados',
          unidadesNecessarias: ['desembarque-seguro'],
        },
        {
          acaoId: 'noe.arco-iris.contemplado',
          unidadesNecessarias: ['contemplacao-da-alianca'],
        },
      ],
      selahFinal: 'genesis-9-13',
    },
  },
]

export const momentoNoePorId = new Map(
  momentosNoe.map((momento) => [momento.id, momento]),
)
