import type { MomentoNoe } from './types'

/**
 * Approved World 2 route. The five Selahs intentionally reuse the passages
 * already accepted by the proxy; all remaining beats are local actions.
 */
export const momentosNoe = [
  {
    id: 'chamado-canteiro',
    ordem: 1,
    titulo: 'O chamado e o canteiro',
    faseCenario: 'vale-calmo',
    gatilhoConclusao: {
      tipo: 'todos-os-marcos',
      marcos: [{ tipo: 'acao-concluida', acaoId: 'noe.chamado.confirmado' }],
    },
  },
  {
    id: 'coleta-vedacao',
    ordem: 2,
    titulo: 'A coleta e a vedação',
    faseCenario: 'canteiro-preparado',
    gatilhoConclusao: {
      tipo: 'todos-os-marcos',
      marcos: [
        { tipo: 'acao-concluida', acaoId: 'noe.madeira.coletada' },
        { tipo: 'acao-concluida', acaoId: 'noe.rampa.reparada' },
        { tipo: 'acao-concluida', acaoId: 'noe.betume.aplicado' },
        { tipo: 'selah-concluido', passagemId: 'genesis-6-14' },
      ],
    },
  },
  {
    id: 'estoque-mantimentos',
    ordem: 3,
    titulo: 'O estoque de mantimentos',
    faseCenario: 'estoque-organizado',
    gatilhoConclusao: {
      tipo: 'todos-os-marcos',
      marcos: [{ tipo: 'acao-concluida', acaoId: 'noe.estoque.organizado' }],
    },
  },
  {
    id: 'conducao-animais',
    ordem: 4,
    titulo: 'A chegada dos animais',
    faseCenario: 'campo-das-familias',
    gatilhoConclusao: {
      tipo: 'todos-os-marcos',
      marcos: [{ tipo: 'acao-concluida', acaoId: 'noe.familias.guiadas' }],
    },
  },
  {
    id: 'acomodacao-animais',
    ordem: 5,
    titulo: 'A acomodação e o Selah',
    faseCenario: 'arca-acolhedora',
    gatilhoConclusao: {
      tipo: 'todos-os-marcos',
      marcos: [
        { tipo: 'acao-concluida', acaoId: 'noe.habitats.organizados' },
        { tipo: 'selah-concluido', passagemId: 'genesis-6-19' },
      ],
    },
  },
  {
    id: 'fechamento-porta',
    ordem: 6,
    titulo: 'O fechamento da porta',
    faseCenario: 'porta-fechada',
    gatilhoConclusao: {
      tipo: 'todos-os-marcos',
      marcos: [
        { tipo: 'acao-concluida', acaoId: 'noe.porta.atravessada' },
        { tipo: 'selah-concluido', passagemId: 'genesis-7-1' },
      ],
    },
  },
  {
    id: 'refugio-tempestade',
    ordem: 7,
    titulo: 'O refúgio na tempestade',
    faseCenario: 'refugio-seguro',
    gatilhoConclusao: {
      tipo: 'todos-os-marcos',
      marcos: [
        { tipo: 'acao-concluida', acaoId: 'noe.filhotes.cuidados' },
        { tipo: 'selah-concluido', passagemId: 'genesis-8-1' },
      ],
    },
  },
  {
    id: 'retorno-pomba',
    ordem: 8,
    titulo: 'O retorno da pomba',
    faseCenario: 'esperanca-retornando',
    gatilhoConclusao: {
      tipo: 'todos-os-marcos',
      marcos: [{ tipo: 'acao-concluida', acaoId: 'noe.pomba.retornou' }],
    },
  },
  {
    id: 'nova-terra-arco-iris',
    ordem: 9,
    titulo: 'A nova terra e o arco-íris',
    faseCenario: 'nova-alianca',
    gatilhoConclusao: {
      tipo: 'todos-os-marcos',
      marcos: [
        { tipo: 'acao-concluida', acaoId: 'noe.animais.desembarcados' },
        { tipo: 'acao-concluida', acaoId: 'noe.arco-iris.contemplado' },
        { tipo: 'selah-concluido', passagemId: 'genesis-9-13' },
      ],
    },
  },
] as const satisfies readonly MomentoNoe[]

export const momentoNoePorId = new Map(
  momentosNoe.map((momento) => [momento.id, momento]),
)
