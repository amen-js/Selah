import type { MomentoCriacaoId } from '../components/game/creation/progression/types.ts'
import type { Idioma } from '../types/selah.ts'

export type FaseNarracaoCriacao = 'inicial' | 'apoio' | 'transicao'

export type NarracaoCriacaoId =
  `criacao.${MomentoCriacaoId}.${FaseNarracaoCriacao}`

export interface NarracaoCriacaoResolvida {
  narracaoId: NarracaoCriacaoId
  momentoId: MomentoCriacaoId
  fase: FaseNarracaoCriacao
  idioma: Idioma
  texto: string
}

export const narracoesCriacao = {
  'criacao.vazio.inicial': {
    'pt-BR':
      'No começo, tudo era escuro e bem silencioso... Não havia nada aqui. Dê alguns passos e vamos descobrir o primeiro caminho juntos!',
    'en-US':
      "At first, everything was dark and very quiet... There was nothing here. Take a few steps, and let's discover the first path together!",
    'es-ES':
      'Al principio, todo estaba oscuro y muy silencioso... No había nada aquí. ¡Da unos pasos y descubramos juntos el primer camino!',
  },
  'criacao.vazio.apoio': {
    'pt-BR':
      'Siga devagarinho. O mundo está só esperando a nossa chegada.',
    'en-US': 'Keep going slowly. The world is just waiting for us to arrive.',
    'es-ES':
      'Sigue despacito. El mundo solo está esperando nuestra llegada.',
  },
  'criacao.vazio.transicao': {
    'pt-BR':
      'Você ouve isso? Algo maravilhoso está prestes a acontecer...',
    'en-US': 'Do you hear that? Something wonderful is about to happen...',
    'es-ES': '¿Oyes eso? Algo maravilloso está a punto de suceder...',
  },
  'criacao.luz.inicial': {
    'pt-BR':
      'Olhe só! Pontos brilhantes surgiram. Vamos seguir os sinais luminosos e ver a luz aparecer?',
    'en-US':
      'Look! Bright points have appeared. Shall we follow the glowing signs and watch the light appear?',
    'es-ES':
      '¡Mira! Aparecieron puntos brillantes. ¿Seguimos las señales luminosas para ver aparecer la luz?',
  },
  'criacao.luz.apoio': {
    'pt-BR':
      'Toque na luz pequenina para que ela se espalhe por todo lugar!',
    'en-US': 'Touch the little light so it can spread everywhere!',
    'es-ES': '¡Toca la lucecita para que se extienda por todas partes!',
  },
  'criacao.luz.transicao': {
    'pt-BR':
      "E Deus disse: 'Haja luz!' E a luz apareceu. Como é bonito ver tudo iluminado!",
    'en-US':
      "And God said, 'Let there be light!' And the light appeared. How beautiful everything looks filled with light!",
    'es-ES':
      "Y Dios dijo: '¡Que haya luz!'. Y apareció la luz. ¡Qué bonito es verlo todo iluminado!",
  },
  'criacao.ceu-terra-aguas.inicial': {
    'pt-BR':
      'Uau! Agora nós temos chão para pisar e águas para navegar. Vamos caminhar até o ponto mais alto para ver os rios nascerem?',
    'en-US':
      'Wow! Now we have ground to walk on and waters to sail. Shall we walk to the highest point and watch the rivers begin?',
    'es-ES':
      '¡Guau! Ahora tenemos tierra que pisar y aguas por las que navegar. ¿Caminamos hasta el punto más alto para ver nacer los ríos?',
  },
  'criacao.ceu-terra-aguas.apoio': {
    'pt-BR':
      'Acompanhe o barulhinho da água do rio para encontrar o próximo caminho.',
    'en-US':
      'Follow the gentle sound of the river water to find the next path.',
    'es-ES':
      'Sigue el suave sonido del agua del río para encontrar el siguiente camino.',
  },
  'criacao.ceu-terra-aguas.transicao': {
    'pt-BR':
      'As águas se juntaram e a terra firme apareceu. O nosso mundo está ganhando forma!',
    'en-US':
      'The waters came together, and dry land appeared. Our world is taking shape!',
    'es-ES':
      '¡Las aguas se juntaron y apareció la tierra firme. Nuestro mundo está tomando forma!',
  },
  'criacao.natureza.inicial': {
    'pt-BR':
      'Veja estes Pontos da Criação no chão! Chegue pertinho e interaja para ver as cores surgirem.',
    'en-US':
      'Look at these Creation Points on the ground! Come closer and interact to watch the colors appear.',
    'es-ES':
      '¡Mira estos Puntos de la Creación en el suelo! Acércate e interactúa para ver aparecer los colores.',
  },
  'criacao.natureza.apoio': {
    'pt-BR':
      'Toque na sementinha brilhante. O que será que vai brotar dali?',
    'en-US': 'Touch the little glowing seed. What do you think will sprout?',
    'es-ES':
      'Toca la semillita brillante. ¿Qué crees que brotará de ella?',
  },
  'criacao.natureza.transicao': {
    'pt-BR':
      'Árvores altas, grama verde e flores coloridas! A terra ficou cheia de vida.',
    'en-US':
      'Tall trees, green grass, and colorful flowers! The earth became full of life.',
    'es-ES':
      '¡Árboles altos, hierba verde y flores de colores! La tierra se llenó de vida.',
  },
  'criacao.ceu-ritmo.inicial': {
    'pt-BR':
      'O sol iluminou o dia todo, e agora o céu está mudando de cor... Vamos olhar para cima?',
    'en-US':
      'The sun shone all day, and now the sky is changing color... Shall we look up?',
    'es-ES':
      'El sol iluminó todo el día y ahora el cielo está cambiando de color... ¿Miramos hacia arriba?',
  },
  'criacao.ceu-ritmo.apoio': {
    'pt-BR':
      'Espere um pouquinho e observe as luzes brilhando lá no alto.',
    'en-US': 'Wait a little and watch the lights shining high above.',
    'es-ES':
      'Espera un poquito y observa las luces que brillan allá arriba.',
  },
  'criacao.ceu-ritmo.transicao': {
    'pt-BR':
      'O sol para o dia, a lua e as estrelas para a noite. Tudo no seu tempo certo.',
    'en-US':
      'The sun for the day, the moon and the stars for the night. Everything at just the right time.',
    'es-ES':
      'El sol para el día, la luna y las estrellas para la noche. Todo a su debido tiempo.',
  },
  'criacao.criaturas.inicial': {
    'pt-BR':
      'Ouça esses sons! Tem bichinhos escondidos por aqui. Vamos encontrar, observar e registrar cada um no nosso Livro da Criação?',
    'en-US':
      'Listen to those sounds! There are little animals hiding nearby. Shall we find, observe, and record each one in our Book of Creation?',
    'es-ES':
      '¡Escucha esos sonidos! Hay animalitos escondidos por aquí. ¿Los encontramos, observamos y registramos en nuestro Libro de la Creación?',
  },
  'criacao.criaturas.apoio': {
    'pt-BR':
      'Ande devagar para não assustar o novo amigo. Que som ele faz?',
    'en-US':
      'Walk slowly so you do not scare our new friend. What sound does it make?',
    'es-ES':
      'Camina despacio para no asustar al nuevo amigo. ¿Qué sonido hace?',
  },
  'criacao.criaturas.transicao': {
    'pt-BR':
      'Que descoberta linda! Este novo amigo agora tem um lugar especial no nosso Livro da Criação.',
    'en-US':
      'What a wonderful discovery! This new friend now has a special place in our Book of Creation.',
    'es-ES':
      '¡Qué descubrimiento tan bonito! Este nuevo amigo ahora tiene un lugar especial en nuestro Libro de la Creación.',
  },
  'criacao.eden.inicial': {
    'pt-BR':
      'Chegamos ao lugar mais especial de todos: o Jardim do Éden! Explore livremente este lugar cheio de luz.',
    'en-US':
      'We have reached the most special place of all: the Garden of Eden! Explore this place full of light freely.',
    'es-ES':
      '¡Llegamos al lugar más especial de todos: el Jardín del Edén! Explora libremente este lugar lleno de luz.',
  },
  'criacao.eden.apoio': {
    'pt-BR':
      'Caminhe pelas margens do rio e descubra os cantinhos secretos do Jardim.',
    'en-US':
      'Walk along the riverbanks and discover the Garden\'s secret corners.',
    'es-ES':
      'Camina por las orillas del río y descubre los rincones secretos del Jardín.',
  },
  'criacao.eden.transicao': {
    'pt-BR': 'Tudo aqui é paz, harmonia e alegria.',
    'en-US': 'Everything here is peaceful, harmonious, and joyful.',
    'es-ES': 'Aquí todo es paz, armonía y alegría.',
  },
  'criacao.adao-e-eva.inicial': {
    'pt-BR':
      'Olhe ali! Deus criou seres muito especiais para cuidar de todo esse Jardim e viver em amizade com Ele.',
    'en-US':
      'Look over there! God created very special people to care for this whole Garden and live in friendship with Him.',
    'es-ES':
      '¡Mira allí! Dios creó personas muy especiales para cuidar de todo este Jardín y vivir en amistad con Él.',
  },
  'criacao.adao-e-eva.apoio': {
    'pt-BR':
      'Eles receberam a tarefa de dar nome aos animais e cuidar de cada plantinha com carinho.',
    'en-US':
      'They were given the task of naming the animals and caring for every little plant with love.',
    'es-ES':
      'Recibieron la tarea de poner nombre a los animales y cuidar con cariño cada plantita.',
  },
  'criacao.adao-e-eva.transicao': {
    'pt-BR':
      'O ser humano faz parte dessa linda história e tem um lugar muito amado na Criação.',
    'en-US':
      'Humanity is part of this beautiful story and has a dearly loved place in Creation.',
    'es-ES':
      'La humanidad forma parte de esta hermosa historia y tiene un lugar muy amado en la Creación.',
  },
  'criacao.fruto-escolha.inicial': {
    'pt-BR':
      'No centro do Jardim existe uma árvore especial. Deus deu uma orientação carinhosa para proteger Adão e Eva...',
    'en-US':
      'At the center of the Garden stands a special tree. God gave loving guidance to protect Adam and Eve...',
    'es-ES':
      'En el centro del Jardín hay un árbol especial. Dios dio una orientación cariñosa para proteger a Adán y Eva...',
  },
  'criacao.fruto-escolha.apoio': {
    'pt-BR':
      'Deus disse que eles podiam comer de tudo, menos daquela árvore. Mas eles escolheram não obedecer...',
    'en-US':
      'God said they could eat from everything except that tree. But they chose not to obey...',
    'es-ES':
      'Dios dijo que podían comer de todo, excepto de aquel árbol. Pero eligieron no obedecer...',
  },
  'criacao.fruto-escolha.transicao': {
    'pt-BR':
      'O mundo perfeito havia sido criado, mas uma escolha mudou a história.',
    'en-US':
      'The perfect world had been created, but one choice changed the story.',
    'es-ES':
      'El mundo perfecto había sido creado, pero una elección cambió la historia.',
  },
} as const satisfies Record<NarracaoCriacaoId, Record<Idioma, string>>

const idiomasSuportados = new Set<Idioma>(['pt-BR', 'en-US', 'es-ES'])

function ehNarracaoCriacaoId(valor: string): valor is NarracaoCriacaoId {
  return Object.prototype.hasOwnProperty.call(narracoesCriacao, valor)
}

function ehIdioma(valor: string): valor is Idioma {
  return idiomasSuportados.has(valor as Idioma)
}

export function buscarNarracaoCriacao(
  narracaoId: string,
  idioma: string,
): NarracaoCriacaoResolvida | undefined {
  if (!ehNarracaoCriacaoId(narracaoId) || !ehIdioma(idioma)) return undefined

  const [, momentoId, fase] = narracaoId.split('.') as [
    'criacao',
    MomentoCriacaoId,
    FaseNarracaoCriacao,
  ]

  return {
    narracaoId,
    momentoId,
    fase,
    idioma,
    texto: narracoesCriacao[narracaoId][idioma],
  }
}
