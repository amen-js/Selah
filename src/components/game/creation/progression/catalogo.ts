import type { MomentoCriacao } from './types'

/** Approved Creation beats from the GDD, expressed as engine data. */
export const momentosCriacao = [
  {
    id: 'vazio',
    ordem: 1,
    titulo: 'O vazio',
    falaInicial:
      'No começo, tudo era escuro e bem silencioso... Não havia nada aqui. Dê alguns passos e vamos descobrir o primeiro caminho juntos!',
    falaApoio: 'Siga devagarinho. O mundo está só esperando a nossa chegada.',
    falaConclusao: 'Você ouve isso? Algo maravilhoso está prestes a acontecer...',
    faseCenario: 'escuro',
    gatilhoConclusao: { tipo: 'distancia-percorrida', distanciaMinima: 4 },
    assets: ['ambiente-vazio', 'luz-guia', 'som-vazio'],
  },
  {
    id: 'luz',
    ordem: 2,
    titulo: 'A luz',
    falaInicial:
      'Olhe só! Pontos brilhantes surgiram. Vamos seguir os sinais luminosos e ver a luz aparecer?',
    falaApoio: 'Toque na luz pequenina para que ela se espalhe por todo lugar!',
    falaConclusao: "E Deus disse: 'Haja luz!' E a luz apareceu. Como é bonito ver tudo iluminado!",
    faseCenario: 'amanhecer',
    gatilhoConclusao: { tipo: 'selah-concluido', passagemId: 'genesis-1-3' },
    assets: ['luz-guia', 'nucleo-luz', 'marcadores-caminho-luz', 'som-revelacao-luz'],
  },
  {
    id: 'ceu-terra-aguas',
    ordem: 3,
    titulo: 'Céu, terra e águas',
    falaInicial:
      'Uau! Agora nós temos chão para pisar e águas para navegar. Vamos caminhar até o ponto mais alto para ver os rios nascerem?',
    falaApoio: 'Acompanhe o barulhinho da água do rio para encontrar o próximo caminho.',
    falaConclusao: 'As águas se juntaram e a terra firme apareceu. O nosso mundo está ganhando forma!',
    faseCenario: 'mundo-formado',
    gatilhoConclusao: {
      tipo: 'zona-narrativa',
      zonaId: 'mirante-dos-rios',
      posicao: [-14, 2.5, 5],
      raio: 3,
    },
    assets: ['terreno-criacao', 'rios', 'lago', 'montanhas', 'som-agua'],
  },
  {
    id: 'natureza',
    ordem: 4,
    titulo: 'A natureza ganha vida',
    falaInicial:
      'Veja estes Pontos da Criação no chão! Chegue pertinho e interaja para ver as cores surgirem.',
    falaApoio: 'Toque na sementinha brilhante. O que será que vai brotar dali?',
    falaConclusao: 'Árvores altas, grama verde e flores coloridas! A terra ficou cheia de vida.',
    faseCenario: 'mundo-verde',
    gatilhoConclusao: { tipo: 'selah-concluido', passagemId: 'genesis-1-11' },
    assets: ['arvores', 'arbustos', 'flores', 'grama', 'efeito-crescimento'],
  },
  {
    id: 'ceu-ritmo',
    ordem: 5,
    titulo: 'O céu ganha ritmo',
    falaInicial:
      'O sol iluminou o dia todo, e agora o céu está mudando de cor... Vamos olhar para cima?',
    falaApoio: 'Espere um pouquinho e observe as luzes brilhando lá no alto.',
    falaConclusao: 'O sol para o dia, a lua e as estrelas para a noite. Tudo no seu tempo certo.',
    faseCenario: 'ciclo-celeste',
    gatilhoConclusao: {
      tipo: 'zona-narrativa',
      zonaId: 'observatorio-do-ceu',
      posicao: [0, 2, -17],
      raio: 3,
    },
    assets: ['sol', 'lua', 'estrelas', 'nuvens', 'som-transicao-celeste'],
  },
  {
    id: 'criaturas',
    ordem: 6,
    titulo: 'As criaturas',
    falaInicial:
      'Ouça esses sons! Tem bichinhos escondidos por aqui. Vamos encontrar, observar e registrar cada um no nosso Livro da Criação?',
    falaApoio: 'Ande devagar para não assustar o novo amigo. Que som ele faz?',
    falaConclusao: 'Que descoberta linda! O leão, a girafa e a ovelha agora têm um lar seguro no nosso livro.',
    faseCenario: 'mundo-vivo',
    gatilhoConclusao: { tipo: 'selah-concluido', passagemId: 'genesis-1-24' },
    assets: ['leao', 'girafa', 'ovelha', 'sons-animais'],
  },
  {
    id: 'eden',
    ordem: 7,
    titulo: 'O Jardim do Éden',
    falaInicial:
      'Chegamos ao lugar mais especial de todos: o Jardim do Éden! Explore livremente este lugar cheio de luz.',
    falaApoio: 'Caminhe pelas margens do rio e descubra os cantinhos secretos do Jardim.',
    falaConclusao: 'Tudo aqui é paz, harmonia e alegria.',
    faseCenario: 'jardim',
    gatilhoConclusao: {
      tipo: 'zona-narrativa',
      zonaId: 'coracao-do-eden',
      posicao: [0, 1, -2],
      raio: 3,
    },
    assets: ['jardim-eden', 'arvore-central', 'rios-eden', 'som-eden'],
  },
  {
    id: 'adao-e-eva',
    ordem: 8,
    titulo: 'Adão e Eva',
    falaInicial:
      'Olhe ali! Deus criou seres muito especiais para cuidar de todo esse Jardim e viver em amizade com Ele.',
    falaApoio: 'Eles receberam a tarefa de dar nome aos animais e cuidar de cada plantinha com carinho.',
    falaConclusao: 'O ser humano faz parte dessa linda história e tem um lugar muito amado na Criação.',
    faseCenario: 'humanidade',
    gatilhoConclusao: { tipo: 'selah-concluido', passagemId: 'genesis-1-27' },
    assets: ['adao', 'eva', 'animacao-idle-humanos'],
  },
  {
    id: 'fruto-escolha',
    ordem: 9,
    titulo: 'O fruto e a grande escolha',
    falaInicial:
      'No centro do Jardim existe uma árvore especial. Deus deu uma orientação carinhosa para proteger Adão e Eva...',
    falaApoio:
      'Deus disse que eles podiam comer de tudo, menos daquela árvore. Mas eles escolheram não obedecer...',
    falaConclusao:
      'Apesar de essa escolha ter mudado as coisas, o amor do Criador continua ao nosso lado. E Ele viu tudo o que fez, e ficou muito bom!',
    faseCenario: 'escolha',
    gatilhoConclusao: {
      tipo: 'zona-narrativa',
      zonaId: 'arvore-do-conhecimento',
      posicao: [12, 1, -12],
      raio: 2.8,
    },
    assets: ['arvore-conhecimento', 'fruto-nao-interativo', 'som-encerramento-criacao'],
  },
] as const satisfies readonly MomentoCriacao[]

export const momentoCriacaoPorId = new Map(
  momentosCriacao.map((momento) => [momento.id, momento]),
)

/** Stable integration key shared by the Creation runtime and asset manifests. */
export type AssetCriacaoId = (typeof momentosCriacao)[number]['assets'][number]
