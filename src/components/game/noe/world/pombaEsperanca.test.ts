import { describe, expect, it } from 'vitest'
import {
  criarCheckpointProgressaoNoe,
  reconstruirProgressaoNoe,
} from '../progression/checkpoint'
import { processarEventoProgressaoNoe } from '../progression/estado'
import type { EstadoProgressaoNoe } from '../progression/types'
import {
  obterEstadoVisualPombaEsperancaNoe,
  resolverCandidatoPombaEsperancaNoe,
} from './pombaEsperanca'

const MOMENTOS_ANTES_DA_POMBA = [
  'chamado-canteiro',
  'coleta-vedacao',
  'estoque-mantimentos',
  'conducao-animais',
  'acomodacao-animais',
  'fechamento-porta',
  'refugio-tempestade',
] as const

function criarEstadoM8(): EstadoProgressaoNoe {
  return reconstruirProgressaoNoe({
    versao: 1,
    momentosConcluidos: MOMENTOS_ANTES_DA_POMBA,
    progressoMomentoAtual: [],
  })
}

describe('pomba da esperança de Noé', () => {
  it('não vaza a cena antes de M8', () => {
    const estado = reconstruirProgressaoNoe({
      versao: 1,
      momentosConcluidos: MOMENTOS_ANTES_DA_POMBA.slice(0, -1),
      progressoMomentoAtual: [],
    })

    expect(obterEstadoVisualPombaEsperancaNoe(estado).visivel).toBe(false)
    expect(
      resolverCandidatoPombaEsperancaNoe(
        { x: 0, y: 4.7, z: -28.35 },
        estado,
      ),
    ).toBeNull()
  })

  it('exige envio antes do retorno e não depende de timer', () => {
    let estado = criarEstadoM8()
    const posicaoJanela = { x: 0, y: 4.7, z: -28.35 }

    expect(
      resolverCandidatoPombaEsperancaNoe(posicaoJanela, estado),
    ).toMatchObject({
      acaoId: 'noe.pomba.enviada',
      unidadeId: 'envio-janela-superior',
      etapa: 1,
    })

    estado = processarEventoProgressaoNoe(estado, {
      tipo: 'unidade-acao-concluida',
      acaoId: 'noe.pomba.enviada',
      unidadeId: 'envio-janela-superior',
    })

    expect(obterEstadoVisualPombaEsperancaNoe(estado)).toMatchObject({
      fase: 'retornando-com-oliveira',
      carregaRamoOliveira: true,
    })
    expect(
      resolverCandidatoPombaEsperancaNoe(posicaoJanela, estado),
    ).toMatchObject({
      acaoId: 'noe.pomba.retornou',
      unidadeId: 'retorno-com-oliveira',
      etapa: 2,
    })
  })

  it('persiste o voo de retorno com o ramo pelo checkpoint', () => {
    const enviada = processarEventoProgressaoNoe(criarEstadoM8(), {
      tipo: 'unidade-acao-concluida',
      acaoId: 'noe.pomba.enviada',
      unidadeId: 'envio-janela-superior',
    })
    const restaurada = reconstruirProgressaoNoe(
      criarCheckpointProgressaoNoe(enviada),
    )

    expect(obterEstadoVisualPombaEsperancaNoe(restaurada)).toEqual(
      obterEstadoVisualPombaEsperancaNoe(enviada),
    )
  })

  it('mantém a pomba pousada com oliveira depois de avançar para M9', () => {
    let estado = criarEstadoM8()
    estado = processarEventoProgressaoNoe(estado, {
      tipo: 'unidade-acao-concluida',
      acaoId: 'noe.pomba.enviada',
      unidadeId: 'envio-janela-superior',
    })
    estado = processarEventoProgressaoNoe(estado, {
      tipo: 'unidade-acao-concluida',
      acaoId: 'noe.pomba.retornou',
      unidadeId: 'retorno-com-oliveira',
    })

    expect(estado.momentoAtualId).toBe('nova-terra-arco-iris')
    expect(obterEstadoVisualPombaEsperancaNoe(estado)).toMatchObject({
      visivel: true,
      fase: 'pousada-com-oliveira',
      carregaRamoOliveira: true,
      janelaIluminada: false,
    })
  })
})
