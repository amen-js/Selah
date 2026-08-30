import type { AcaoNoeId, MomentoNoeId } from './types'

export interface UnidadeAcaoNoe {
  acaoId: AcaoNoeId
  unidadeId: string
}

interface MigracaoUnidadeNoe {
  momentoId: MomentoNoeId
  acaoId: AcaoNoeId
  unidadeId: string
  unidadesCanonicas: readonly UnidadeAcaoNoe[]
}

/**
 * World 2 shipped its progression foundation with one placeholder unit per
 * beat. These aliases keep v1 checkpoints and already-mounted runtimes useful
 * while the canonical catalogue records the detailed cooperative actions.
 */
const migracoesUnidadesLegadas: readonly MigracaoUnidadeNoe[] = [
  {
    momentoId: 'estoque-mantimentos',
    acaoId: 'noe.estoque.organizado',
    unidadeId: 'estoque-principal',
    unidadesCanonicas: [
      {
        acaoId: 'noe.mantimento.feno-armazenado',
        unidadeId: 'feno-estabulos-inferiores',
      },
      {
        acaoId: 'noe.mantimento.graos-armazenados',
        unidadeId: 'graos-poleiros-superiores',
      },
      {
        acaoId: 'noe.mantimento.agua-armazenada',
        unidadeId: 'agua-reserva-central',
      },
      {
        acaoId: 'noe.mantimento.frutas-armazenadas',
        unidadeId: 'frutas-despensa-central',
      },
    ],
  },
  {
    momentoId: 'conducao-animais',
    acaoId: 'noe.familias.guiadas',
    unidadeId: 'familias-do-campo',
    unidadesCanonicas: [
      {
        acaoId: 'noe.animais.aves-guiadas',
        unidadeId: 'aves-trilha-sementes',
      },
      {
        acaoId: 'noe.animais.herbivoros-guiados',
        unidadeId: 'grandes-herbivoros-ponte-alinhada',
      },
      {
        acaoId: 'noe.animais.mamiferos-guiados',
        unidadeId: 'pequenos-mamiferos-cestos',
      },
    ],
  },
  {
    momentoId: 'acomodacao-animais',
    acaoId: 'noe.habitats.organizados',
    unidadeId: 'habitats-da-arca',
    unidadesCanonicas: [
      {
        acaoId: 'noe.habitat.grandes-animais-preparado',
        unidadeId: 'nivel-inferior-elefantes',
      },
      {
        acaoId: 'noe.habitat.grandes-animais-preparado',
        unidadeId: 'nivel-inferior-girafas',
      },
      {
        acaoId: 'noe.habitat.grandes-animais-preparado',
        unidadeId: 'nivel-inferior-leoes',
      },
      {
        acaoId: 'noe.habitat.grandes-animais-preparado',
        unidadeId: 'nivel-inferior-ovelhas',
      },
      {
        acaoId: 'noe.habitat.grandes-animais-preparado',
        unidadeId: 'nivel-inferior-zebras',
      },
      {
        acaoId: 'noe.habitat.pequenos-mamiferos-preparado',
        unidadeId: 'nivel-medio-coelhos',
      },
      {
        acaoId: 'noe.habitat.aves-preparado',
        unidadeId: 'nivel-superior-aves',
      },
      {
        acaoId: 'noe.habitat.familia-noe-preparado',
        unidadeId: 'nivel-superior-familia-noe',
      },
    ],
  },
  {
    momentoId: 'fechamento-porta',
    acaoId: 'noe.porta.atravessada',
    unidadeId: 'entrada-segura',
    unidadesCanonicas: [
      {
        acaoId: 'noe.abrigo.chamado-ouvido',
        unidadeId: 'chamado-final-noe',
      },
      {
        acaoId: 'noe.abrigo.entrada-concluida',
        unidadeId: 'entrada-segura-na-arca',
      },
      {
        acaoId: 'noe.porta.fechada',
        unidadeId: 'porta-da-arca-fechada',
      },
    ],
  },
  {
    momentoId: 'refugio-tempestade',
    acaoId: 'noe.filhotes.cuidados',
    unidadeId: 'cuidado-dos-filhotes',
    unidadesCanonicas: [
      {
        acaoId: 'noe.cuidado.filhotes-aves',
        unidadeId: 'filhotes-aves-alimentados',
      },
      {
        acaoId: 'noe.cuidado.filhotes-herbivoros',
        unidadeId: 'filhotes-herbivoros-alimentados',
      },
      {
        acaoId: 'noe.cuidado.filhotes-mamiferos',
        unidadeId: 'filhotes-mamiferos-alimentados',
      },
    ],
  },
  {
    momentoId: 'nova-terra-arco-iris',
    acaoId: 'noe.animais.desembarcados',
    unidadeId: 'desembarque-seguro',
    unidadesCanonicas: [
      {
        acaoId: 'noe.desembarque.aves',
        unidadeId: 'aves-desembarcadas-em-grupo',
      },
      {
        acaoId: 'noe.desembarque.herbivoros',
        unidadeId: 'herbivoros-desembarcados-em-grupo',
      },
      {
        acaoId: 'noe.desembarque.mamiferos',
        unidadeId: 'mamiferos-desembarcados-em-grupo',
      },
    ],
  },
]

export function expandirUnidadeCompativelNoe(
  momentoId: MomentoNoeId,
  acaoId: string,
  unidadeId: string,
): readonly UnidadeAcaoNoe[] {
  const migracao = migracoesUnidadesLegadas.find(
    (item) =>
      item.momentoId === momentoId &&
      item.acaoId === acaoId &&
      item.unidadeId === unidadeId,
  )

  return (
    migracao?.unidadesCanonicas ?? [{ acaoId: acaoId as AcaoNoeId, unidadeId }]
  )
}
