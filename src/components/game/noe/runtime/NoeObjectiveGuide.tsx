import { useMemo } from 'react'
import {
  quantidadeConcluidaTarefaNoe,
  obterMomentoAtualNoe,
  obterRequisitosPendentesNoe,
  type AcaoNoeId,
  type EstadoProgressaoNoe,
  type MomentoNoeId,
} from '../progression'
import {
  useTranslation,
  type TranslationKey,
} from '../../../../i18n'

const TITULO_MOMENTO: Readonly<Record<MomentoNoeId, TranslationKey>> = {
  'chamado-canteiro': 'noe.journey.m1.title',
  'coleta-vedacao': 'noe.journey.m2.title',
  'estoque-mantimentos': 'noe.journey.m3.title',
  'conducao-animais': 'noe.journey.m4.title',
  'acomodacao-animais': 'noe.journey.m5.title',
  'fechamento-porta': 'noe.journey.m6.title',
  'refugio-tempestade': 'noe.journey.m7.title',
  'retorno-pomba': 'noe.journey.m8.title',
  'nova-terra-arco-iris': 'noe.journey.m9.title',
}

const OBJETIVO_ACAO: Readonly<Partial<Record<AcaoNoeId, TranslationKey>>> = {
  'noe.chamado.confirmado': 'noe.objective.mission',
  'noe.madeira.coletada': 'noe.objective.planks',
  'noe.rampa.reparada': 'noe.objective.ramp',
  'noe.betume.aplicado': 'noe.objective.sealing',
  'noe.mantimento.feno-armazenado': 'noe.objective.hay',
  'noe.mantimento.graos-armazenados': 'noe.objective.grain',
  'noe.mantimento.agua-armazenada': 'noe.objective.water',
  'noe.mantimento.frutas-armazenadas': 'noe.objective.fruit',
  'noe.animais.aves-guiadas': 'noe.objective.birds',
  'noe.animais.herbivoros-guiados': 'noe.objective.herbivores',
  'noe.animais.mamiferos-guiados': 'noe.objective.mammals',
  'noe.habitat.grandes-animais-preparado': 'noe.objective.largeHabitat',
  'noe.habitat.pequenos-mamiferos-preparado': 'noe.objective.smallHabitat',
  'noe.habitat.aves-preparado': 'noe.objective.birdHabitat',
  'noe.habitat.familia-noe-preparado': 'noe.objective.familyHabitat',
  'noe.abrigo.chamado-ouvido': 'noe.objective.finalCall',
  'noe.abrigo.entrada-concluida': 'noe.objective.enterArk',
  'noe.porta.fechada': 'noe.objective.closeDoor',
  'noe.cuidado.filhotes-aves': 'noe.objective.feedBirds',
  'noe.cuidado.filhotes-herbivoros': 'noe.objective.feedHerbivores',
  'noe.cuidado.filhotes-mamiferos': 'noe.objective.feedMammals',
  'noe.pomba.enviada': 'noe.objective.sendDove',
  'noe.pomba.retornou': 'noe.objective.receiveDove',
  'noe.desembarque.aves': 'noe.objective.disembarkBirds',
  'noe.desembarque.herbivoros': 'noe.objective.disembarkHerbivores',
  'noe.desembarque.mamiferos': 'noe.objective.disembarkMammals',
  'noe.altar.construido': 'noe.objective.altar',
  'noe.arco-iris.contemplado': 'noe.objective.rainbow',
}

export interface NoeObjectiveGuideProps {
  estado: EstadoProgressaoNoe | null
  visible: boolean
}

export function NoeObjectiveGuide({
  estado,
  visible,
}: NoeObjectiveGuideProps) {
  const { t } = useTranslation()
  const resumo = useMemo(() => {
    if (!estado) return null
    const momento = obterMomentoAtualNoe(estado)
    const pendentes = obterRequisitosPendentesNoe(estado)
    const total = momento.gatilhoConclusao.tarefas.reduce(
      (soma, tarefa) => soma + tarefa.unidadesNecessarias.length,
      0,
    )
    const concluidas = momento.gatilhoConclusao.tarefas.reduce(
      (soma, tarefa) =>
        soma + quantidadeConcluidaTarefaNoe(estado, tarefa.acaoId),
      0,
    )
    const primeiro = pendentes[0]
    const objetivo = estado.concluida
      ? 'noe.objective.complete'
      : primeiro?.tipo === 'selah-final'
        ? 'noe.objective.selah'
        : primeiro?.tipo === 'tarefa-local'
          ? (OBJETIVO_ACAO[primeiro.acaoId] ?? 'noe.objective.explore')
          : 'noe.objective.explore'

    return { momento, total, concluidas, objetivo }
  }, [estado])

  if (!visible || !resumo) return null

  const percentual = resumo.total
    ? Math.round((resumo.concluidas / resumo.total) * 100)
    : 100

  return (
    <aside
      className="noe-objective-guide"
      aria-label={t('noe.objective.aria')}
    >
      <div className="noe-objective-guide__heading">
        <span>
          {t('noe.objective.moment', {
            current: resumo.momento.ordem,
            total: 9,
          })}
        </span>
        <strong>{percentual}%</strong>
      </div>
      <h2>{t(TITULO_MOMENTO[resumo.momento.id])}</h2>
      <p>{t(resumo.objetivo)}</p>
      <progress
        value={resumo.concluidas}
        max={Math.max(1, resumo.total)}
        aria-label={t('noe.objective.progressAria', {
          completed: resumo.concluidas,
          total: resumo.total,
        })}
      />
    </aside>
  )
}
