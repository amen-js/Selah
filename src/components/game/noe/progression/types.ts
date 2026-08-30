export type MomentoNoeId =
  | 'chamado-canteiro'
  | 'coleta-vedacao'
  | 'estoque-mantimentos'
  | 'conducao-animais'
  | 'acomodacao-animais'
  | 'fechamento-porta'
  | 'refugio-tempestade'
  | 'retorno-pomba'
  | 'nova-terra-arco-iris'

export type FaseCenarioNoe =
  | 'vale-calmo'
  | 'canteiro-preparado'
  | 'estoque-organizado'
  | 'campo-das-familias'
  | 'arca-acolhedora'
  | 'porta-fechada'
  | 'refugio-seguro'
  | 'esperanca-retornando'
  | 'nova-alianca'

export type AcaoNoeId =
  | 'noe.chamado.confirmado'
  | 'noe.madeira.coletada'
  | 'noe.rampa.reparada'
  | 'noe.betume.aplicado'
  | 'noe.estoque.organizado'
  | 'noe.familias.guiadas'
  | 'noe.habitats.organizados'
  | 'noe.porta.atravessada'
  | 'noe.filhotes.cuidados'
  | 'noe.pomba.retornou'
  | 'noe.animais.desembarcados'
  | 'noe.arco-iris.contemplado'

export type MarcoConclusaoNoe =
  | { tipo: 'acao-concluida'; acaoId: AcaoNoeId }
  | { tipo: 'selah-concluido'; passagemId: string }

/** Every Noah beat closes only after each declared local or Selah marker. */
export interface GatilhoConclusaoMomentoNoe {
  tipo: 'todos-os-marcos'
  marcos: readonly MarcoConclusaoNoe[]
}

export interface MomentoNoe {
  id: MomentoNoeId
  ordem: number
  titulo: string
  faseCenario: FaseCenarioNoe
  gatilhoConclusao: GatilhoConclusaoMomentoNoe
}

export type EventoProgressaoNoe = MarcoConclusaoNoe

export interface EstadoProgressaoNoe {
  momentoAtualId: MomentoNoeId
  momentosConcluidos: readonly MomentoNoeId[]
  /** Markers are scoped to the current, incomplete moment. */
  marcosMomentoAtualConcluidos: readonly MarcoConclusaoNoe[]
  concluida: boolean
}

export type PercentualPreparacaoNoe = 0 | 33 | 66 | 100

export type FaseClimaNoe =
  | 'calmo'
  | 'nuvens-leves'
  | 'vento-suave'
  | 'abrigo-pronto'
  | 'chuva-segura'
  | 'luz-retornando'
  | 'nova-terra'

export interface ClimaNoe {
  percentualPreparacao: PercentualPreparacaoNoe
  fase: FaseClimaNoe
  chuvaAtiva: boolean
}
