import { describe, expect, it } from 'vitest'
import { momentosCriacao } from '../components/game/creation/progression'
import type { Idioma } from '../types/selah'
import {
  buscarNarracaoCriacao,
  narracoesCriacao,
  type FaseNarracaoCriacao,
  type NarracaoCriacaoId,
} from './creationNarrations'

const fases = ['inicial', 'apoio', 'transicao'] as const satisfies readonly FaseNarracaoCriacao[]
const idiomas = ['pt-BR', 'en-US', 'es-ES'] as const satisfies readonly Idioma[]

const idsEsperados = momentosCriacao.flatMap(({ id }) =>
  fases.map((fase) => `criacao.${id}.${fase}` as NarracaoCriacaoId),
)

const textosAprovadosPtBr: Record<NarracaoCriacaoId, string> = {
  'criacao.vazio.inicial':
    'No começo, tudo era escuro e bem silencioso... Não havia nada aqui. Dê alguns passos e vamos descobrir o primeiro caminho juntos!',
  'criacao.vazio.apoio':
    'Siga devagarinho. O mundo está só esperando a nossa chegada.',
  'criacao.vazio.transicao':
    'Você ouve isso? Algo maravilhoso está prestes a acontecer...',
  'criacao.luz.inicial':
    'Olhe só! Pontos brilhantes surgiram. Vamos seguir os sinais luminosos e ver a luz aparecer?',
  'criacao.luz.apoio':
    'Toque na luz pequenina para que ela se espalhe por todo lugar!',
  'criacao.luz.transicao':
    "E Deus disse: 'Haja luz!' E a luz apareceu. Como é bonito ver tudo iluminado!",
  'criacao.ceu-terra-aguas.inicial':
    'Uau! Agora nós temos chão para pisar e águas para navegar. Vamos caminhar até o ponto mais alto para ver os rios nascerem?',
  'criacao.ceu-terra-aguas.apoio':
    'Acompanhe o barulhinho da água do rio para encontrar o próximo caminho.',
  'criacao.ceu-terra-aguas.transicao':
    'As águas se juntaram e a terra firme apareceu. O nosso mundo está ganhando forma!',
  'criacao.natureza.inicial':
    'Veja estes Pontos da Criação no chão! Chegue pertinho e interaja para ver as cores surgirem.',
  'criacao.natureza.apoio':
    'Toque na sementinha brilhante. O que será que vai brotar dali?',
  'criacao.natureza.transicao':
    'Árvores altas, grama verde e flores coloridas! A terra ficou cheia de vida.',
  'criacao.ceu-ritmo.inicial':
    'O sol iluminou o dia todo, e agora o céu está mudando de cor... Vamos olhar para cima?',
  'criacao.ceu-ritmo.apoio':
    'Espere um pouquinho e observe as luzes brilhando lá no alto.',
  'criacao.ceu-ritmo.transicao':
    'O sol para o dia, a lua e as estrelas para a noite. Tudo no seu tempo certo.',
  'criacao.criaturas.inicial':
    'Ouça esses sons! Tem bichinhos escondidos por aqui. Vamos encontrar, observar e registrar cada um no nosso Livro da Criação?',
  'criacao.criaturas.apoio':
    'Ande devagar para não assustar o novo amigo. Que som ele faz?',
  'criacao.criaturas.transicao':
    'Que descoberta linda! Este novo amigo agora tem um lugar especial no nosso Livro da Criação.',
  'criacao.eden.inicial':
    'Chegamos ao lugar mais especial de todos: o Jardim do Éden! Explore livremente este lugar cheio de luz.',
  'criacao.eden.apoio':
    'Caminhe pelas margens do rio e descubra os cantinhos secretos do Jardim.',
  'criacao.eden.transicao': 'Tudo aqui é paz, harmonia e alegria.',
  'criacao.adao-e-eva.inicial':
    'Olhe ali! Deus criou seres muito especiais para cuidar de todo esse Jardim e viver em amizade com Ele.',
  'criacao.adao-e-eva.apoio':
    'Eles receberam a tarefa de dar nome aos animais e cuidar de cada plantinha com carinho.',
  'criacao.adao-e-eva.transicao':
    'O ser humano faz parte dessa linda história e tem um lugar muito amado na Criação.',
  'criacao.fruto-escolha.inicial':
    'No centro do Jardim existe uma árvore especial. Deus deu uma orientação carinhosa para proteger Adão e Eva...',
  'criacao.fruto-escolha.apoio':
    'Deus disse que eles podiam comer de tudo, menos daquela árvore. Mas eles escolheram não obedecer...',
  'criacao.fruto-escolha.transicao':
    'O mundo perfeito havia sido criado, mas uma escolha mudou a história.',
}

describe('catálogo aprovado de narrações da Criação', () => {
  it('expõe exatamente as 27 combinações canônicas de momento e fase', () => {
    expect(Object.keys(narracoesCriacao)).toEqual(idsEsperados)
    expect(idsEsperados).toHaveLength(27)
  })

  it('preserva em pt-BR as falas editoriais aprovadas no GDD', () => {
    for (const narracaoId of idsEsperados) {
      expect(buscarNarracaoCriacao(narracaoId, 'pt-BR')?.texto).toBe(
        textosAprovadosPtBr[narracaoId],
      )
    }
  })

  it('resolve texto não vazio e metadados exatos nos três idiomas', () => {
    for (const narracaoId of idsEsperados) {
      const [, momentoId, fase] = narracaoId.split('.')

      for (const idioma of idiomas) {
        expect(buscarNarracaoCriacao(narracaoId, idioma)).toEqual({
          narracaoId,
          momentoId,
          fase,
          idioma,
          texto: expect.stringMatching(/\S/),
        })
      }

      expect(buscarNarracaoCriacao(narracaoId, 'en-US')?.texto).not.toBe(
        textosAprovadosPtBr[narracaoId],
      )
      expect(buscarNarracaoCriacao(narracaoId, 'es-ES')?.texto).not.toBe(
        textosAprovadosPtBr[narracaoId],
      )
    }
  })

  it('rejeita IDs e idiomas fora da allowlist sem resolução parcial', () => {
    expect(buscarNarracaoCriacao('criacao.vazio', 'pt-BR')).toBeUndefined()
    expect(buscarNarracaoCriacao('criacao.vazio.inventada', 'pt-BR')).toBeUndefined()
    expect(buscarNarracaoCriacao('criacao.inexistente.inicial', 'pt-BR')).toBeUndefined()
    expect(buscarNarracaoCriacao('toString', 'pt-BR')).toBeUndefined()
    expect(buscarNarracaoCriacao('criacao.vazio.inicial', 'pt')).toBeUndefined()
    expect(buscarNarracaoCriacao('criacao.vazio.inicial', 'fr-FR')).toBeUndefined()
  })
})
