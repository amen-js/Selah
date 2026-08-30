import type { FaixaEtaria, Idioma } from './passagens.ts'

export type AlternativaId = 'A' | 'B' | 'C' | 'D'

export interface QuizAprovado {
  id: string
  passagemId: string
  idioma: Idioma
  faixaEtaria: FaixaEtaria
  pergunta: string
  alternativas: { id: AlternativaId; texto: string }[]
  respostaCorretaId: AlternativaId
  explicacao: string
  referencia: string
}

interface QuizSeed {
  passagemId: string
  pergunta: Record<Idioma, string>
  correta: Record<Idioma, string>
  erradas: [Record<Idioma, string>, Record<Idioma, string>, Record<Idioma, string>]
  explicacao: Record<Idioma, string>
  referencia: Record<Idioma, string>
}

const IDIOMAS: readonly Idioma[] = ['pt-BR', 'en-US', 'es-ES']
const FAIXAS: readonly FaixaEtaria[] = ['crianca', 'geral']

const SEEDS: readonly QuizSeed[] = [
  {
    passagemId: 'genesis-1-1',
    pergunta: {
      'pt-BR': 'O que Deus criou no princípio?',
      'en-US': 'What did God create in the beginning?',
      'es-ES': '¿Qué creó Dios en el principio?',
    },
    correta: {
      'pt-BR': 'Os céus e a terra',
      'en-US': 'The heavens and the earth',
      'es-ES': 'Los cielos y la tierra',
    },
    erradas: [
      { 'pt-BR': 'Uma grande arca', 'en-US': 'A large ark', 'es-ES': 'Un arca grande' },
      { 'pt-BR': 'O palácio do Egito', 'en-US': 'The palace of Egypt', 'es-ES': 'El palacio de Egipto' },
      { 'pt-BR': 'Um arco nas nuvens', 'en-US': 'A rainbow in the clouds', 'es-ES': 'Un arco en las nubes' },
    ],
    explicacao: {
      'pt-BR': 'A passagem diz que no princípio Deus criou os céus e a terra.',
      'en-US': 'The passage says that in the beginning God created the heavens and the earth.',
      'es-ES': 'El pasaje dice que en el principio Dios creó los cielos y la tierra.',
    },
    referencia: { 'pt-BR': 'Gênesis 1:1', 'en-US': 'Genesis 1:1', 'es-ES': 'Génesis 1:1' },
  },
  {
    passagemId: 'genesis-1-3',
    pergunta: {
      'pt-BR': 'O que aconteceu quando Deus falou?',
      'en-US': 'What happened when God spoke?',
      'es-ES': '¿Qué ocurrió cuando Dios habló?',
    },
    correta: {
      'pt-BR': 'Houve luz',
      'en-US': 'There was light',
      'es-ES': 'Fue la luz',
    },
    erradas: [
      { 'pt-BR': 'Começou a chover', 'en-US': 'It started to rain', 'es-ES': 'Empezó a llover' },
      { 'pt-BR': 'José teve um sonho', 'en-US': 'Joseph had a dream', 'es-ES': 'José tuvo un sueño' },
      { 'pt-BR': 'A arca ficou pronta', 'en-US': 'The ark was finished', 'es-ES': 'El arca quedó lista' },
    ],
    explicacao: {
      'pt-BR': 'A passagem diz: “Haja luz.” E houve luz.',
      'en-US': 'The passage says: “Let there be light,” and there was light.',
      'es-ES': 'El pasaje dice: “Sea la luz”; y fue la luz.',
    },
    referencia: { 'pt-BR': 'Gênesis 1:3', 'en-US': 'Genesis 1:3', 'es-ES': 'Génesis 1:3' },
  },
  {
    passagemId: 'genesis-1-11',
    pergunta: {
      'pt-BR': 'O que a terra deveria produzir?',
      'en-US': 'What was the earth to produce?',
      'es-ES': '¿Qué debía producir la tierra?',
    },
    correta: {
      'pt-BR': 'Erva verde e árvores com fruto',
      'en-US': 'Grass and fruit trees',
      'es-ES': 'Hierba verde y árboles con fruto',
    },
    erradas: [
      { 'pt-BR': 'Uma arca de madeira', 'en-US': 'A wooden ark', 'es-ES': 'Un arca de madera' },
      { 'pt-BR': 'Um palácio', 'en-US': 'A palace', 'es-ES': 'Un palacio' },
      { 'pt-BR': 'Um arco nas nuvens', 'en-US': 'A rainbow', 'es-ES': 'Un arco en las nubes' },
    ],
    explicacao: {
      'pt-BR': 'Deus pediu que a terra produzisse erva verde e árvores frutíferas, e assim foi.',
      'en-US': 'God asked the earth to yield grass and fruit trees, and it was so.',
      'es-ES': 'Dios pidió que la tierra produjera hierba y árboles frutales, y fue así.',
    },
    referencia: { 'pt-BR': 'Gênesis 1:11', 'en-US': 'Genesis 1:11', 'es-ES': 'Génesis 1:11' },
  },
  {
    passagemId: 'genesis-1-24',
    pergunta: {
      'pt-BR': 'O que a terra produziu neste versículo?',
      'en-US': 'What did the earth produce in this verse?',
      'es-ES': '¿Qué produjo la tierra en este versículo?',
    },
    correta: {
      'pt-BR': 'Seres viventes segundo a sua espécie',
      'en-US': 'Living creatures after their kind',
      'es-ES': 'Seres vivientes según su género',
    },
    erradas: [
      { 'pt-BR': 'Uma grande cidade', 'en-US': 'A great city', 'es-ES': 'Una gran ciudad' },
      { 'pt-BR': 'O palácio de Faraó', 'en-US': 'Pharaoh’s palace', 'es-ES': 'El palacio de Faraón' },
      { 'pt-BR': 'Um barco vazio', 'en-US': 'An empty boat', 'es-ES': 'Un barco vacío' },
    ],
    explicacao: {
      'pt-BR': 'Deus mandou que a terra produzisse seres viventes segundo a sua espécie, e assim foi.',
      'en-US': 'God told the earth to produce living creatures after their kind, and it was so.',
      'es-ES': 'Dios mandó que la tierra produjera seres vivientes según su género, y fue así.',
    },
    referencia: { 'pt-BR': 'Gênesis 1:24', 'en-US': 'Genesis 1:24', 'es-ES': 'Génesis 1:24' },
  },
  {
    passagemId: 'genesis-1-27',
    pergunta: {
      'pt-BR': 'À imagem de quem o ser humano foi criado?',
      'en-US': 'In whose image was humankind created?',
      'es-ES': '¿A imagen de quién fue creado el ser humano?',
    },
    correta: {
      'pt-BR': 'À imagem de Deus',
      'en-US': 'In God’s image',
      'es-ES': 'A imagen de Dios',
    },
    erradas: [
      { 'pt-BR': 'À imagem dos animais', 'en-US': 'In the image of animals', 'es-ES': 'A imagen de los animales' },
      { 'pt-BR': 'À imagem da arca', 'en-US': 'In the image of the ark', 'es-ES': 'A imagen del arca' },
      { 'pt-BR': 'À imagem de Faraó', 'en-US': 'In Pharaoh’s image', 'es-ES': 'A imagen de Faraón' },
    ],
    explicacao: {
      'pt-BR': 'A passagem diz que Deus criou o ser humano à sua imagem: homem e mulher os criou.',
      'en-US': 'The passage says God created humankind in his own image: male and female he created them.',
      'es-ES': 'El pasaje dice que Dios creó al ser humano a su imagen: varón y hembra los creó.',
    },
    referencia: { 'pt-BR': 'Gênesis 1:27', 'en-US': 'Genesis 1:27', 'es-ES': 'Génesis 1:27' },
  },
  {
    passagemId: 'genesis-6-14',
    pergunta: {
      'pt-BR': 'O que Noé deveria construir?',
      'en-US': 'What was Noah told to build?',
      'es-ES': '¿Qué debía construir Noé?',
    },
    correta: {
      'pt-BR': 'Uma arca de madeira',
      'en-US': 'A ship of wood',
      'es-ES': 'Un arca de madera',
    },
    erradas: [
      { 'pt-BR': 'Um palácio', 'en-US': 'A palace', 'es-ES': 'Un palacio' },
      { 'pt-BR': 'Uma torre de luz', 'en-US': 'A tower of light', 'es-ES': 'Una torre de luz' },
      { 'pt-BR': 'Uma cidade nova', 'en-US': 'A new city', 'es-ES': 'Una ciudad nueva' },
    ],
    explicacao: {
      'pt-BR': 'A passagem pede: “Faze para ti uma arca de madeira” com compartimentos por dentro.',
      'en-US': 'The passage says: “Make a ship of wood” and make rooms inside it.',
      'es-ES': 'El pasaje pide: “Hazte un arca de madera” con aposentos por dentro.',
    },
    referencia: { 'pt-BR': 'Gênesis 6:14', 'en-US': 'Genesis 6:14', 'es-ES': 'Génesis 6:14' },
  },
  {
    passagemId: 'genesis-6-19',
    pergunta: {
      'pt-BR': 'Quem deveria entrar na arca com Noé?',
      'en-US': 'Who was to enter the ship with Noah?',
      'es-ES': '¿Quién debía entrar en el arca con Noé?',
    },
    correta: {
      'pt-BR': 'Dois de cada espécie, macho e fêmea',
      'en-US': 'Two of every kind, male and female',
      'es-ES': 'Dos de cada especie, macho y hembra',
    },
    erradas: [
      { 'pt-BR': 'Somente as árvores', 'en-US': 'Only the trees', 'es-ES': 'Solamente los árboles' },
      { 'pt-BR': 'Os sonhos de José', 'en-US': 'Joseph’s dreams', 'es-ES': 'Los sueños de José' },
      { 'pt-BR': 'Apenas a luz do dia', 'en-US': 'Only daylight', 'es-ES': 'Solo la luz del día' },
    ],
    explicacao: {
      'pt-BR': 'Deus pediu dois de cada espécie, macho e fêmea, para conservá-los vivos na arca.',
      'en-US': 'God asked for two of every kind, male and female, to keep them alive in the ship.',
      'es-ES': 'Dios pidió dos de cada especie, macho y hembra, para conservarlos vivos en el arca.',
    },
    referencia: { 'pt-BR': 'Gênesis 6:19', 'en-US': 'Genesis 6:19', 'es-ES': 'Génesis 6:19' },
  },
  {
    passagemId: 'genesis-7-1',
    pergunta: {
      'pt-BR': 'O que o Senhor disse a Noé?',
      'en-US': 'What did the Lord tell Noah?',
      'es-ES': '¿Qué dijo el Señor a Noé?',
    },
    correta: {
      'pt-BR': 'Entra tu e tua casa na arca',
      'en-US': 'Come into the ship with your household',
      'es-ES': 'Entra tú y tu casa en el arca',
    },
    erradas: [
      { 'pt-BR': 'Construa um palácio', 'en-US': 'Build a palace', 'es-ES': 'Construye un palacio' },
      { 'pt-BR': 'Conte um sonho a Faraó', 'en-US': 'Tell a dream to Pharaoh', 'es-ES': 'Cuenta un sueño a Faraón' },
      { 'pt-BR': 'Apague a luz', 'en-US': 'Put out the light', 'es-ES': 'Apaga la luz' },
    ],
    explicacao: {
      'pt-BR': 'O Senhor chamou Noé para entrar na arca com toda a sua casa.',
      'en-US': 'The Lord called Noah to enter the ship with all his household.',
      'es-ES': 'El Señor llamó a Noé para entrar en el arca con toda su casa.',
    },
    referencia: { 'pt-BR': 'Gênesis 7:1', 'en-US': 'Genesis 7:1', 'es-ES': 'Génesis 7:1' },
  },
  {
    passagemId: 'genesis-8-1',
    pergunta: {
      'pt-BR': 'Do que Deus se lembrou?',
      'en-US': 'Whom did God remember?',
      'es-ES': '¿De quién se acordó Dios?',
    },
    correta: {
      'pt-BR': 'De Noé e dos animais na arca',
      'en-US': 'Noah and the animals in the ship',
      'es-ES': 'De Noé y de los animales en el arca',
    },
    erradas: [
      { 'pt-BR': 'Do palácio do Egito', 'en-US': 'Egypt’s palace', 'es-ES': 'Del palacio de Egipto' },
      { 'pt-BR': 'Somente das árvores', 'en-US': 'Only the trees', 'es-ES': 'Solamente de los árboles' },
      { 'pt-BR': 'De um sonho esquecido', 'en-US': 'A forgotten dream', 'es-ES': 'De un sueño olvidado' },
    ],
    explicacao: {
      'pt-BR': 'Deus se lembrou de Noé e dos animais na arca, e fez passar um vento sobre a terra.',
      'en-US': 'God remembered Noah and the animals in the ship, and made a wind pass over the earth.',
      'es-ES': 'Dios se acordó de Noé y de los animales en el arca, e hizo pasar un viento sobre la tierra.',
    },
    referencia: { 'pt-BR': 'Gênesis 8:1', 'en-US': 'Genesis 8:1', 'es-ES': 'Génesis 8:1' },
  },
  {
    passagemId: 'genesis-9-13',
    pergunta: {
      'pt-BR': 'O que Deus pôs nas nuvens como sinal?',
      'en-US': 'What did God set in the clouds as a sign?',
      'es-ES': '¿Qué puso Dios en las nubes como señal?',
    },
    correta: {
      'pt-BR': 'O seu arco',
      'en-US': 'His rainbow',
      'es-ES': 'Su arco',
    },
    erradas: [
      { 'pt-BR': 'Uma arca nova', 'en-US': 'A new ark', 'es-ES': 'Un arca nueva' },
      { 'pt-BR': 'Uma torre', 'en-US': 'A tower', 'es-ES': 'Una torre' },
      { 'pt-BR': 'Um palácio', 'en-US': 'A palace', 'es-ES': 'Un palacio' },
    ],
    explicacao: {
      'pt-BR': 'Deus pôs o seu arco nas nuvens como sinal da aliança com a terra.',
      'en-US': 'God set his rainbow in the cloud as a sign of the covenant with the earth.',
      'es-ES': 'Dios puso su arco en las nubes como señal del pacto con la tierra.',
    },
    referencia: { 'pt-BR': 'Gênesis 9:13', 'en-US': 'Genesis 9:13', 'es-ES': 'Génesis 9:13' },
  },
  {
    passagemId: 'genesis-37-5',
    pergunta: {
      'pt-BR': 'O que José fez depois de sonhar?',
      'en-US': 'What did Joseph do after dreaming?',
      'es-ES': '¿Qué hizo José después de soñar?',
    },
    correta: {
      'pt-BR': 'Contou o sonho aos irmãos',
      'en-US': 'He told the dream to his brothers',
      'es-ES': 'Contó el sueño a sus hermanos',
    },
    erradas: [
      { 'pt-BR': 'Construiu uma arca', 'en-US': 'He built an ark', 'es-ES': 'Construyó un arca' },
      { 'pt-BR': 'Apagou a luz', 'en-US': 'He put out the light', 'es-ES': 'Apagó la luz' },
      { 'pt-BR': 'Plantou uma árvore', 'en-US': 'He planted a tree', 'es-ES': 'Plantó un árbol' },
    ],
    explicacao: {
      'pt-BR': 'José sonhou um sonho e o contou a seus irmãos.',
      'en-US': 'Joseph dreamed a dream and told it to his brothers.',
      'es-ES': 'José soñó un sueño y lo contó a sus hermanos.',
    },
    referencia: { 'pt-BR': 'Gênesis 37:5', 'en-US': 'Genesis 37:5', 'es-ES': 'Génesis 37:5' },
  },
  {
    passagemId: 'genesis-39-2',
    pergunta: {
      'pt-BR': 'Quem estava com José?',
      'en-US': 'Who was with Joseph?',
      'es-ES': '¿Quién estaba con José?',
    },
    correta: {
      'pt-BR': 'O Senhor',
      'en-US': 'The Lord',
      'es-ES': 'El Señor',
    },
    erradas: [
      { 'pt-BR': 'A tripulação da arca', 'en-US': 'The ark’s crew', 'es-ES': 'La tripulación del arca' },
      { 'pt-BR': 'Os animais da terra', 'en-US': 'The animals of the earth', 'es-ES': 'Los animales de la tierra' },
      { 'pt-BR': 'A luz do primeiro dia', 'en-US': 'The light of the first day', 'es-ES': 'La luz del primer día' },
    ],
    explicacao: {
      'pt-BR': 'A passagem diz que o Senhor era com José, e ele foi um homem próspero.',
      'en-US': 'The passage says the Lord was with Joseph, and he was a prosperous man.',
      'es-ES': 'El pasaje dice que el Señor estaba con José, y fue varón próspero.',
    },
    referencia: { 'pt-BR': 'Gênesis 39:2', 'en-US': 'Genesis 39:2', 'es-ES': 'Génesis 39:2' },
  },
  {
    passagemId: 'genesis-41-16',
    pergunta: {
      'pt-BR': 'De quem viria a resposta a Faraó?',
      'en-US': 'Who would give Pharaoh an answer?',
      'es-ES': '¿De quién vendría la respuesta a Faraón?',
    },
    correta: {
      'pt-BR': 'De Deus',
      'en-US': 'From God',
      'es-ES': 'De Dios',
    },
    erradas: [
      { 'pt-BR': 'Da arca de Noé', 'en-US': 'From Noah’s ark', 'es-ES': 'Del arca de Noé' },
      { 'pt-BR': 'Das árvores da terra', 'en-US': 'From the trees of the earth', 'es-ES': 'De los árboles de la tierra' },
      { 'pt-BR': 'Da luz criada', 'en-US': 'From the created light', 'es-ES': 'De la luz creada' },
    ],
    explicacao: {
      'pt-BR': 'José disse que a resposta não estava nele: Deus daria resposta de paz a Faraó.',
      'en-US': 'Joseph said the answer was not in him: God would give Pharaoh an answer of peace.',
      'es-ES': 'José dijo que la respuesta no estaba en él: Dios daría respuesta de paz a Faraón.',
    },
    referencia: { 'pt-BR': 'Gênesis 41:16', 'en-US': 'Genesis 41:16', 'es-ES': 'Génesis 41:16' },
  },
  {
    passagemId: 'genesis-45-5',
    pergunta: {
      'pt-BR': 'Por que José diz que Deus o enviou adiante?',
      'en-US': 'Why does Joseph say God sent him ahead?',
      'es-ES': '¿Por qué dice José que Dios lo envió delante?',
    },
    correta: {
      'pt-BR': 'Para conservar a vida',
      'en-US': 'To preserve life',
      'es-ES': 'Para preservar la vida',
    },
    erradas: [
      { 'pt-BR': 'Para construir uma arca', 'en-US': 'To build an ark', 'es-ES': 'Para construir un arca' },
      { 'pt-BR': 'Para apagar a luz', 'en-US': 'To put out the light', 'es-ES': 'Para apagar la luz' },
      { 'pt-BR': 'Para plantar árvores', 'en-US': 'To plant trees', 'es-ES': 'Para plantar árboles' },
    ],
    explicacao: {
      'pt-BR': 'José explica que Deus o enviou adiante para conservação da vida.',
      'en-US': 'Joseph explains that God sent him ahead to preserve life.',
      'es-ES': 'José explica que Dios lo envió delante para preservación de la vida.',
    },
    referencia: { 'pt-BR': 'Gênesis 45:5', 'en-US': 'Genesis 45:5', 'es-ES': 'Génesis 45:5' },
  },
  {
    passagemId: 'genesis-50-20',
    pergunta: {
      'pt-BR': 'O que Deus fez com o que outros intentaram para o mal?',
      'en-US': 'What did God do with what others meant for harm?',
      'es-ES': '¿Qué hizo Dios con lo que otros pensaron para mal?',
    },
    correta: {
      'pt-BR': 'Intentou para bem, para conservar vidas',
      'en-US': 'Meant it for good, to save many lives',
      'es-ES': 'Lo encaminó a bien, para conservar vidas',
    },
    erradas: [
      { 'pt-BR': 'Pediu uma arca nova', 'en-US': 'Asked for a new ark', 'es-ES': 'Pidió un arca nueva' },
      { 'pt-BR': 'Apagou a luz do mundo', 'en-US': 'Put out the world’s light', 'es-ES': 'Apagó la luz del mundo' },
      { 'pt-BR': 'Plantou erva na terra', 'en-US': 'Planted grass on the earth', 'es-ES': 'Plantó hierba en la tierra' },
    ],
    explicacao: {
      'pt-BR': 'José diz que o mal intentado contra ele Deus encaminhou para bem, para conservar muita gente.',
      'en-US': 'Joseph says that what was meant for harm God meant for good, to save many people.',
      'es-ES': 'José dice que lo pensado para mal Dios lo encaminó a bien, para mantener en vida a mucho pueblo.',
    },
    referencia: { 'pt-BR': 'Gênesis 50:20', 'en-US': 'Genesis 50:20', 'es-ES': 'Génesis 50:20' },
  },
]

const expandir = (seed: QuizSeed, idioma: Idioma, faixaEtaria: FaixaEtaria): QuizAprovado => ({
  id: `fallback:${seed.passagemId}:${idioma}:${faixaEtaria}`,
  passagemId: seed.passagemId,
  idioma,
  faixaEtaria,
  pergunta: seed.pergunta[idioma],
  alternativas: [
    { id: 'A', texto: seed.correta[idioma] },
    { id: 'B', texto: seed.erradas[0][idioma] },
    { id: 'C', texto: seed.erradas[1][idioma] },
    { id: 'D', texto: seed.erradas[2][idioma] },
  ],
  respostaCorretaId: 'A',
  explicacao: seed.explicacao[idioma],
  referencia: seed.referencia[idioma],
})

export const QUIZZES_APROVADOS: readonly QuizAprovado[] = SEEDS.flatMap((seed) =>
  IDIOMAS.flatMap((idioma) => FAIXAS.map((faixa) => expandir(seed, idioma, faixa))),
)

const porId = new Map(QUIZZES_APROVADOS.map((quiz) => [quiz.id, quiz]))

export const buscarQuizAprovadoPorId = (quizId: string): QuizAprovado | undefined => porId.get(quizId)

export const buscarQuizAprovado = (
  passagemId: string,
  idioma: Idioma,
  faixaEtaria: FaixaEtaria,
): QuizAprovado | undefined =>
  porId.get(`fallback:${passagemId}:${idioma}:${faixaEtaria}`) ??
  QUIZZES_APROVADOS.find((quiz) => quiz.passagemId === passagemId && quiz.idioma === idioma)
