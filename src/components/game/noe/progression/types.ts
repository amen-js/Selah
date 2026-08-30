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

export type AreaNoeId =
  'canteiro-vale' | 'campo-animais' | 'interior-arca' | 'ararate-nova-terra'

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
  | 'noe.mantimento.feno-armazenado'
  | 'noe.mantimento.graos-armazenados'
  | 'noe.mantimento.agua-armazenada'
  | 'noe.mantimento.frutas-armazenadas'
  | 'noe.animais.aves-guiadas'
  | 'noe.animais.herbivoros-guiados'
  | 'noe.animais.mamiferos-guiados'
  | 'noe.habitat.grandes-animais-preparado'
  | 'noe.habitat.pequenos-mamiferos-preparado'
  | 'noe.habitat.aves-preparado'
  | 'noe.habitat.familia-noe-preparado'
  | 'noe.abrigo.chamado-ouvido'
  | 'noe.abrigo.entrada-concluida'
  | 'noe.porta.fechada'
  | 'noe.cuidado.filhotes-aves'
  | 'noe.cuidado.filhotes-herbivoros'
  | 'noe.cuidado.filhotes-mamiferos'
  | 'noe.pomba.enviada'
  | 'noe.pomba.retornou'
  | 'noe.desembarque.aves'
  | 'noe.desembarque.herbivoros'
  | 'noe.desembarque.mamiferos'
  | 'noe.altar.construido'
  | 'noe.arco-iris.contemplado'
  /** @deprecated Checkpoint/runtime aliases kept for World 2 v1 compatibility. */
  | 'noe.estoque.organizado'
  | 'noe.familias.guiadas'
  | 'noe.habitats.organizados'
  | 'noe.porta.atravessada'
  | 'noe.filhotes.cuidados'
  | 'noe.animais.desembarcados'

export interface TarefaMomentoNoe {
  acaoId: AcaoNoeId
  /** Stable unit IDs declared by the catalogue and accepted by checkpoints. */
  unidadesNecessarias: readonly string[]
  /**
   * Tasks in the same stage are free-order. A higher stage unlocks only after
   * every task in lower stages is complete. Omission preserves v1's strict
   * declaration order.
   */
  etapa?: number
}

/** Local tasks must finish before the optional final Selah can close a beat. */
export interface GatilhoConclusaoMomentoNoe {
  tipo: 'tarefas-locais-e-selah-opcional'
  /** Tasks unlock by stage; units and tasks inside one stage are free-order. */
  tarefas: readonly TarefaMomentoNoe[]
  selahFinal?: string
}

export interface MomentoNoe {
  id: MomentoNoeId
  ordem: number
  titulo: string
  areaId: AreaNoeId
  faseCenario: FaseCenarioNoe
  gatilhoConclusao: GatilhoConclusaoMomentoNoe
}

export type EventoProgressaoNoe =
  | {
      tipo: 'unidade-acao-concluida'
      acaoId: AcaoNoeId
      /** Stable scene/task unit ID; makes repeated runtime events idempotent. */
      unidadeId: string
    }
  | { tipo: 'selah-concluido'; passagemId: string }

export interface ProgressoAcaoNoe {
  acaoId: AcaoNoeId
  unidadesConcluidas: readonly string[]
}

export interface EstadoProgressaoNoe {
  momentoAtualId: MomentoNoeId
  momentosConcluidos: readonly MomentoNoeId[]
  /** Unit IDs are scoped to the current, incomplete moment. */
  progressoMomentoAtual: readonly ProgressoAcaoNoe[]
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
