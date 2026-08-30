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
          unidadesNecessarias: [
            'fenda-casco-1',
            'fenda-casco-2',
            'fenda-casco-3',
          ],
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
          acaoId: 'noe.mantimento.feno-armazenado',
          unidadesNecessarias: ['feno-estabulos-inferiores'],
          etapa: 1,
        },
        {
          acaoId: 'noe.mantimento.graos-armazenados',
          unidadesNecessarias: ['graos-poleiros-superiores'],
          etapa: 1,
        },
        {
          acaoId: 'noe.mantimento.agua-armazenada',
          unidadesNecessarias: ['agua-reserva-central'],
          etapa: 1,
        },
        {
          acaoId: 'noe.mantimento.frutas-armazenadas',
          unidadesNecessarias: ['frutas-despensa-central'],
          etapa: 1,
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
          acaoId: 'noe.animais.aves-guiadas',
          unidadesNecessarias: ['aves-trilha-sementes'],
          etapa: 1,
        },
        {
          acaoId: 'noe.animais.herbivoros-guiados',
          unidadesNecessarias: ['grandes-herbivoros-ponte-alinhada'],
          etapa: 1,
        },
        {
          acaoId: 'noe.animais.mamiferos-guiados',
          unidadesNecessarias: ['pequenos-mamiferos-cestos'],
          etapa: 1,
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
          acaoId: 'noe.habitat.grandes-animais-preparado',
          unidadesNecessarias: [
            'nivel-inferior-elefantes',
            'nivel-inferior-girafas',
            'nivel-inferior-leoes',
            'nivel-inferior-ovelhas',
            'nivel-inferior-zebras',
          ],
          etapa: 1,
        },
        {
          acaoId: 'noe.habitat.pequenos-mamiferos-preparado',
          unidadesNecessarias: ['nivel-medio-coelhos'],
          etapa: 1,
        },
        {
          acaoId: 'noe.habitat.aves-preparado',
          unidadesNecessarias: ['nivel-superior-aves'],
          etapa: 1,
        },
        {
          acaoId: 'noe.habitat.familia-noe-preparado',
          unidadesNecessarias: ['nivel-superior-familia-noe'],
          etapa: 1,
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
          acaoId: 'noe.abrigo.chamado-ouvido',
          unidadesNecessarias: ['chamado-final-noe'],
          etapa: 1,
        },
        {
          acaoId: 'noe.abrigo.entrada-concluida',
          unidadesNecessarias: ['entrada-segura-na-arca'],
          etapa: 2,
        },
        {
          acaoId: 'noe.porta.fechada',
          unidadesNecessarias: ['porta-da-arca-fechada'],
          etapa: 3,
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
          acaoId: 'noe.cuidado.filhotes-aves',
          unidadesNecessarias: ['filhotes-aves-alimentados'],
          etapa: 1,
        },
        {
          acaoId: 'noe.cuidado.filhotes-herbivoros',
          unidadesNecessarias: ['filhotes-herbivoros-alimentados'],
          etapa: 1,
        },
        {
          acaoId: 'noe.cuidado.filhotes-mamiferos',
          unidadesNecessarias: ['filhotes-mamiferos-alimentados'],
          etapa: 1,
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
          acaoId: 'noe.pomba.enviada',
          unidadesNecessarias: ['envio-janela-superior'],
          etapa: 1,
        },
        {
          acaoId: 'noe.pomba.retornou',
          unidadesNecessarias: ['retorno-com-oliveira'],
          etapa: 2,
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
          acaoId: 'noe.desembarque.aves',
          unidadesNecessarias: ['aves-desembarcadas-em-grupo'],
          etapa: 1,
        },
        {
          acaoId: 'noe.desembarque.herbivoros',
          unidadesNecessarias: ['herbivoros-desembarcados-em-grupo'],
          etapa: 1,
        },
        {
          acaoId: 'noe.desembarque.mamiferos',
          unidadesNecessarias: ['mamiferos-desembarcados-em-grupo'],
          etapa: 1,
        },
        {
          acaoId: 'noe.altar.construido',
          unidadesNecessarias: ['altar-de-gratidao'],
          etapa: 2,
        },
        {
          acaoId: 'noe.arco-iris.contemplado',
          unidadesNecessarias: ['contemplacao-da-alianca'],
          etapa: 3,
        },
      ],
      selahFinal: 'genesis-9-13',
    },
  },
]

export const momentoNoePorId = new Map(
  momentosNoe.map((momento) => [momento.id, momento]),
)
