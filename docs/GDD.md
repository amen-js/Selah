# Selah — Game Design Document

> Status: em evolução, com o Mundo 1 validado pela P.O. e o detalhamento do Mundo 2 incorporado.
>
> Este documento descreve o jogo e sua experiência. Stack, responsáveis e cronograma permanecem no plano de execução.

## Visão do jogo

**Selah** é um jogo bíblico 3D de exploração para crianças. Cada mundo transforma uma história selecionada pela equipe em uma jornada interativa de descoberta, missão e reflexão.

A experiência alterna entre movimento e pausa: a criança explora, interage com a narrativa e encontra passagens bíblicas; no **Momento Selah**, o ritmo desacelera para leitura e um quiz contextual. Ao final, a **Pausa Selah real** interrompe a exploração até a liberação do responsável, levando a proposta de pausa para fora da tela.

## Público inicial

- **5 a 11 anos:** público principal, sempre acompanhado por pais ou responsáveis
- **12 a 18 anos:** faixa complementar, também monitorada pelos pais ou responsáveis
- Linguagem, histórias e desafios classificados antes de entrarem no jogo

## Pilares da experiência

1. **Explorar:** descobrir um mundo bíblico vivo em vez de apenas assistir à história
2. **Participar:** ajudar personagens por meio de tarefas ligadas à narrativa
3. **Compreender:** conectar ações do jogo a passagens previamente selecionadas
4. **Pausar:** criar intervalos intencionais dentro e fora da tela

## Linha principal

```text
CRIAR → SALVAR → RESTAURAR
```

Outra forma de apresentar a mesma progressão:

```text
O COMEÇO DE TUDO → UMA GRANDE MISSÃO → UM GRANDE PROPÓSITO
```

Essa linha organiza os três primeiros mundos e dá sentido à evolução da jornada. Ela ainda deverá ser revisada pela P.O. quanto à linguagem, às referências e à adequação bíblica para o público escolhido.

## Estrutura da jornada

| Ordem | Mundo | Ideia central | Verbo de progressão |
| --- | --- | --- | --- |
| 1 | A Criação | O mundo ganha vida | Criar |
| 2 | Noé e a Arca | Uma grande missão antes da tempestade | Salvar |
| 3 | José, o Sonhador | Superação, perdão e propósito | Restaurar |

## Mundo 1 — A Criação: o início de tudo

### Premissa

O mundo ganha vida. A criança acompanha a narrativa da criação da luz, da natureza e dos animais.

### Fantasia do jogador

Estar presente no início de um mundo vazio que progressivamente se enche de luz, cor, movimento e vida. O Aventureiro não cria o mundo nem apenas assiste à história: ele atua como uma **testemunha ativa da Criação**, descobrindo e revelando simbolicamente as transformações enquanto elas acontecem.

### Papel do jogador

A criança explora o cenário, percebe sinais, encontra um Ponto da Criação e interage. Essa interação revela a transformação preparada naquele local — por exemplo, um vale vazio passa a receber plantas, vegetação e árvores. A sensação desejada é: **“Eu estava aqui quando isso foi revelado.”**

O jogador nunca é apresentado como responsável pelo ato da Criação. Sua participação mantém a fase interativa sem substituir o Criador na narrativa.

### Loop do Mundo 1

```text
EXPLORAR → DESCOBRIR → ENCONTRAR UM PONTO DA CRIAÇÃO → INTERAGIR →
O MUNDO SE TRANSFORMA → REGISTRAR A DESCOBERTA
```

### Gameplay-base

- Explorar o ambiente à medida que ele se transforma
- Descobrir e revelar simbolicamente novos elementos da Criação
- Interagir com luz, natureza e animais
- Observar mudanças visuais e sonoras entre cada momento
- Registrar animais e outras descobertas
- Encontrar passagens e ativar Momentos Selah

### Direção da fase

A progressão deve ser marcada por contraste: vazio e preenchimento, escuridão e luz, silêncio e vida. A comunicação da fase não começa com um personagem físico, mas com uma **Voz Guia** (narrador sábio e acolhedor) que acompanha a criança como testemunha ativa.

### Voz do narrador / Guia da Criação

- **Tom:** calmo, pausado, poético e acolhedor, como quem conta uma história de embalar
- **Exibição:** balões de fala com no máximo duas linhas, locução em áudio por TTS neural do OpenRouter e destaques em cores quentes nas palavras de ação
- **Cobertura da locução:** falas iniciais, de apoio e de transição dos nove momentos; a preferência de leitura em voz alta e a faixa etária continuam controlando a reprodução automática
- **Segurança e fallback:** o cliente solicita somente IDs de falas previamente aprovadas e localizadas; texto livre não é sintetizado. Se o OpenRouter estiver indisponível, a mesma fala usa a voz local compatível do dispositivo
- **Feedback:** nunca punitivo; redireciona com convite, não com correção

| Ação do jogador | O que o guia não diz | O que o guia diz (estilo Selah) |
| --- | --- | --- |
| Anda no sentido oposto ao objetivo | "Caminho errado! Volte para a rota." | "Acho que tem algo brilhante nos esperando do outro lado... Vamos lá ver?" |
| Demora para interagir com o Ponto da Criação | "Pressione o botão para continuar." | "Quando você estiver pronto, toque no brilho para revelar uma surpresa!" |
| Toca repetidamente na tela sem foco | "Aguarde a animação terminar." | "Respire fundo... Veja como o vento mexe as folhinhas devagar." |

### Momentos da fase

#### Momento 1 — O vazio

Cenário: espaço escuro, silencioso e com pouca visibilidade.

**Gameplay:** exploração simples, percepção do ambiente e descoberta do primeiro caminho. O contraste prepara a chegada marcante da luz.

- **Inicial:** "No começo, tudo era escuro e bem silencioso... Não havia nada aqui. Dê alguns passos e vamos descobrir o primeiro caminho juntos!"
- **Apoio (se a criança parar):** "Siga devagarinho. O mundo está só esperando a nossa chegada."
- **Transição:** "Você ouve isso? Algo maravilhoso está prestes a acontecer..."

#### Momento 2 — A luz

Cenário: transição da escuridão para a iluminação reveladora.

**Gameplay:** seguir sinais luminosos até o primeiro Momento Selah. A iluminação revela o ambiente e mostra que existe um mundo esperando para ganhar vida.

- **Inicial:** "Olhe só! Pontos brilhantes surgiram. Vamos seguir os sinais luminosos e ver a luz aparecer?"
- **Apoio:** "Toque na luz pequenina para que ela se espalhe por todo lugar!"
- **Momento Selah:** "E Deus disse: 'Haja luz!' E a luz apareceu. Como é bonito ver tudo iluminado!"

#### Momento 3 — Céu, terra e águas

Cenário: o mapa ganha forma com rios, montanhas e caminhos.

**Gameplay:** explorar novas áreas, encontrar passagens entre terra e água, acompanhar rios e descobrir pontos altos. O mundo ganha profundidade, forma e novos caminhos.

- **Inicial:** "Uau! Agora nós temos chão para pisar e águas para navegar. Vamos caminhar até o ponto mais alto para ver os rios nascerem?"
- **Apoio:** "Acompanhe o barulhinho da água do rio para encontrar o próximo caminho."
- **Conclusão:** "As águas se juntaram e a terra firme apareceu. O nosso mundo está ganhando forma!"

#### Momento 4 — A natureza ganha vida

Cenário: surgimento de plantas, vegetação, flores, frutos e árvores.

**Gameplay:** encontrar Pontos da Criação e interagir para revelar simbolicamente a natureza surgindo. A criança descobre e testemunha o que acontece; ela não cria os elementos.

- **Inicial:** "Veja estes Pontos da Criação no chão! Chegue pertinho e interaja para ver as cores surgirem."
- **Apoio:** "Toque na sementinha brilhante. O que será que vai brotar dali?"
- **Momento Selah:** "Árvores altas, grama verde e flores coloridas! A terra ficou cheia de vida."

#### Momento 5 — O céu ganha ritmo

Cenário: passagem do dia, entardecer, noite e surgimento das estrelas.

**Gameplay:** explorar durante diferentes períodos, observar o céu e ativar um Momento Selah de contemplação.

- **Inicial:** "O sol iluminou o dia todo, e agora o céu está mudando de cor... Vamos olhar para cima?"
- **Apoio:** "Espere um pouquinho e observe as luzes brilhando lá no alto."
- **Momento Selah:** "O sol para o dia, a lua e as estrelas para a noite. Tudo no seu tempo certo."

#### Momento 6 — As criaturas

Cenário: descoberta dos animais no Campo da Criação, no Vale das Águas e no Bosque da Vida.

**Loop:** explorar → encontrar → observar → descobrir → registrar. Cada criatura deve ser percebida como uma descoberta, não como um simples item colecionável.

- **Inicial:** "Ouça esses sons! Tem bichinhos escondidos por aqui. Vamos encontrar, observar e registrar cada um no nosso Livro da Criação?"
- **Apoio:** "Ande devagar para não assustar o novo amigo. Que som ele faz?"
- **Ao registrar o animal:** "Que descoberta linda! Este novo amigo agora tem um lugar especial no nosso Livro da Criação."

#### Momento 7 — O Jardim do Éden

Cenário: ponto alto visual, com vegetação exuberante, frutos e rios cristalinos.

**Gameplay:** exploração mais livre, descoberta de áreas especiais, encontros e novos Momentos Selah.

- **Inicial:** "Chegamos ao lugar mais especial de todos: o Jardim do Éden! Explore livremente este lugar cheio de luz."
- **Apoio:** "Caminhe pelas margens do rio e descubra os cantinhos secretos do Jardim."
- **Momento Selah:** "Tudo aqui é paz, harmonia e alegria."

#### Momento 8 — Adão e Eva

Cenário: presença dos primeiros seres humanos integrados ao Jardim.

**Gameplay:** acompanhar pequenos momentos no Jardim por meio de exploração, observação da vida ao redor e interações narrativas simples.

- **Inicial:** "Olhe ali! Deus criou seres muito especiais para cuidar de todo esse Jardim e viver em amizade com Ele."
- **Aproximação:** "Eles receberam a tarefa de dar nome aos animais e cuidar de cada plantinha com carinho."
- **Conclusão:** "O ser humano faz parte dessa linda história e tem um lugar muito amado na Criação."

#### Momento 9 — O fruto e a grande escolha

Cenário: a Árvore do Conhecimento do Bem e do Mal. A criança **não controla Adão ou Eva** e não recebe uma ação como “comer o fruto”; acompanha a narrativa como testemunha ativa.

**Sequência:** explorar o Jardim → encontrar a árvore → conhecer a orientação → observar a situação → acompanhar a escolha → perceber que algo mudou.

- **Inicial:** "No centro do Jardim existe uma árvore especial. Deus deu uma orientação carinhosa para proteger Adão e Eva..."
- **Narrativa:** "Deus disse que eles podiam comer de tudo, menos daquela árvore. Mas eles escolheram não obedecer..."
- **Mensagem infantil:** "Deus deu uma orientação. Adão e Eva escolheram não obedecer."
- **Gancho narrativo:** "O mundo perfeito havia sido criado, mas uma escolha mudou a história."

### Biomas e criaturas do primeiro escopo

| Bioma | Identidade visual | Criaturas e elementos | Função no gameplay |
| --- | --- | --- | --- |
| **Campo da Criação** | Campos verdes, colinas, árvores, flores e pequenos riachos | Leão, girafa, elefante, zebra e ovelha | Introduzir a mecânica de descoberta de criaturas |
| **Vale das Águas** | Rio, cachoeira, lagos, margens e pedras | Peixes, pato, rã e pássaros próximos à água | Promover exploração ambiental e descoberta de caminhos |
| **Bosque da Vida** | Árvores altas, flores, frutos, caminhos escondidos e espaços secretos | Cervo, coelho, esquilo e pássaros | Incentivar exploração e descoberta |
| **Jardim do Éden** | Vegetação exuberante, grandes árvores, rios cristalinos, frutos, flores e luz dourada | Vida animal; Adão; Eva; Árvore da Vida; Árvore do Conhecimento do Bem e do Mal; serpente | Apresentar a humanidade dentro da Criação e encerrar a fase com a grande escolha |

### Objetivos e conclusão da fase

- **Objetivo narrativo:** testemunhar o início da história e perceber o contraste entre um mundo vazio e um mundo cheio de vida.
- **Objetivo jogável:** descobrir os nove Momentos da Criação, explorar os quatro biomas e chegar ao encerramento narrativo no Jardim do Éden.
- **Momento final:** contemplar tudo o que ganhou vida, contrastando o começo — escuridão, vazio e silêncio — com o mundo agora cheio de luz, águas, natureza, animais, sons e humanidade.
- **Mensagem de encerramento:** “E Deus viu tudo o que havia feito, e tudo havia ficado muito bom.” — Gênesis 1:31.
- **Gancho para a continuidade:** o mundo perfeito havia sido criado, mas uma escolha mudou a história.

### Escopo consolidado do Mundo 1

- **9 momentos:** O Vazio; A Luz; Céu, Terra e Águas; A Natureza; O Céu Ganha Ritmo; As Criaturas; O Jardim do Éden; Adão e Eva; O Fruto e a Grande Escolha
- **4 biomas:** Campo da Criação; Vale das Águas; Bosque da Vida; Jardim do Éden
- **Gameplay principal:** explorar → descobrir → revelar → interagir → contemplar
- **Resumo da jornada:** do vazio à vida → da Criação ao Jardim → do Jardim à primeira escolha

### Questões abertas

- Quais passagens bíblicas oficiais entram em cada momento?

### Decisão de locução

A Voz Guia terá locução ao longo de toda a jornada da Criação, não apenas nos
Momentos Selah. A síntese neural usará o TTS do OpenRouter já adotado pelo
projeto, com roteiro localizado e previamente aprovado, voz local como fallback
e cancelamento imediato quando a exploração for bloqueada ou o momento mudar.

## Mundo 2 — Noé e a Arca: a grande missão

### Premissa

Noé e sua família se preparam para cumprir uma grande missão antes do Dilúvio: construir a Arca, organizar os mantimentos e conduzir os animais para um abrigo seguro. A criança acompanha esse trabalho sem enfrentar perigo ou pressão de tempo.

### Fantasia do jogador

Participar de uma missão com objetivo claro, ajudando Noé e sua família a preparar a Arca e cuidar dos animais. A criança atua como **ajudante da missão e testemunha da aliança**, percebendo a fidelidade de Deus e a preservação da vida ao longo da jornada.

### Papel do jogador

A criança explora os ambientes, coleta e organiza recursos, repara acessos, ajuda a vedar a Arca, conduz grupos de animais e prepara os espaços internos. Sua participação é simbólica e cooperativa: ela contribui com as tarefas, mas não substitui Noé, não altera os acontecimentos da narrativa bíblica e não precisa correr contra a tempestade.

### Loop do Mundo 2

```text
EXPLORAR → COLETAR E ORGANIZAR → PREPARAR O ABRIGO → ACOMODAR A VIDA →
TESTEMUNHAR A PROMESSA → REGISTRAR NO LIVRO
```

### Gameplay-base

- Explorar o vale, o campo dos animais, os três níveis da Arca e a nova terra
- Coletar madeira de gôfer, betume e mantimentos
- Reparar acessos e ajudar na impermeabilização da Arca
- Conduzir famílias de animais por comportamentos e em grupos
- Organizar suprimentos e acomodar cada espécie em seu espaço
- Ajudar Noé e sua família a cuidar dos animais durante a tempestade
- Acompanhar o retorno da pomba e desembarcar os animais
- Encontrar passagens e ativar Momentos Selah

### Direção da fase

A aproximação da chuva cria progressão narrativa e mudança de atmosfera, mas não usa pressão excessiva, punição emocional ou urgência manipulativa. O clima muda progressivamente conforme as tarefas são concluídas — em marcos visuais de 33%, 66% e 100% — sem cronômetro ou risco de falha.

A chuva só começa depois que todas as tarefas forem concluídas e todos estiverem em segurança dentro da Arca. Nuvens, vento e som comunicam a transformação de maneira gradual; trovões assustadores e outros estímulos intensos ficam fora do escopo. Durante a tempestade, o interior da Arca deve transmitir acolhimento, descanso, paz e proteção.

### Momentos da fase

#### Momento 1 — O chamado e o canteiro de obras

Cenário: um vale calmo, cercado por árvores de gôfer, com a grande estrutura de madeira da Arca em construção e uma oficina de carpintaria.

**Gameplay:** explorar o canteiro, interagir com Noé e seus filhos e reconhecer a dimensão do projeto. O momento apresenta a missão e o propósito do trabalho antes de qualquer mudança no clima.

#### Momento 2 — A coleta de materiais e a impermeabilização

Cenário: bosques, áreas de corte, rampas de acesso e a parte externa da Arca.

**Gameplay:** coletar tábuas de madeira de gôfer para reparar os acessos à rampa e aplicar betume nas fendas da madeira em um minigame tátil de deslizar o dedo ou o pincel. A experiência deve comunicar que a criança está ajudando a preparar um refúgio seguro.

#### Momento 3 — O estoque de mantimentos

Cenário: áreas de carga e compartimentos internos preparados para receber os suprimentos.

**Gameplay:** transportar fardos de feno, sacos de grãos, jarras de água e cestos de frutas para os locais corretos. Alimentos para herbívoros ficam próximos aos estábulos; grãos, perto dos poleiros. A tarefa trabalha organização e cuidado prévio com os animais.

#### Momento 4 — A chegada e a condução dos animais

Cenário: vales e colinas ao redor da Arca, com caminhos que levam à rampa de embarque.

**Gameplay:** guiar animais agrupados por famílias e comportamentos. Aves seguem trilhas de sementes, grandes herbívoros atravessam pontes alinhadas pelo jogador e pequenos mamíferos são conduzidos em cestos.

A condução prioriza a cooperação e o movimento de grupos inteiros. Levar cada animal individualmente e repetir a mesma ação diversas vezes não faz parte da experiência.

#### Momento 5 — A acomodação e os Momentos Selah

Cenário: o interior acolhedor da Arca, com divisórias de madeira, palha, lampiões e iluminação suave.

**Gameplay:** resolver um puzzle amigável de encaixe, acomodando cada espécie em um habitat adequado. Ao observar uma família de animais descansando, a criança ativa um Momento Selah. O resultado deve transmitir acolhimento, descanso e segurança.

#### Momento 6 — A mudança do clima e a entrada no abrigo

Cenário: o céu azul recebe gradualmente nuvens cinzentas e o som do vento aumenta, sem trovões assustadores ou cronômetro visível.

**Sequência:** concluir todas as tarefas → ouvir o chamado de Noé → entrar na Arca → ver a grande porta se fechar com segurança → observar as primeiras gotas do lado de fora.

A chuva é um evento narrativo disparado somente após a conclusão da preparação. A criança nunca fica para trás e não perde a missão por demora.

#### Momento 7 — O refúgio durante a tempestade

Cenário: o interior da Arca durante a chuva, com lampiões acesos, sons externos suaves e os animais abrigados.

**Gameplay:** acompanhar Noé e sua família no cuidado com as criaturas, alimentar filhotes e ativar um Momento Selah de oração e gratidão. A mensagem central é que, mesmo com a tempestade do lado de fora, dentro do abrigo há paz e proteção.

#### Momento 8 — A pomba e o ramo de oliveira

Cenário: a tempestade termina e a luz volta a entrar pela janela superior da Arca.

**Gameplay:** ajudar Noé a enviar a pomba e recebê-la quando ela retorna com um ramo verde de oliveira no bico. O momento marca a redescoberta do mundo e a chegada da esperança.

#### Momento 9 — A nova terra e o arco-íris

Cenário: a Arca repousa sobre o Monte Ararate. A porta se abre para uma terra renovada, com vegetação brotando e céu limpo.

**Gameplay:** desembarcar os animais, acompanhar a família de Noé na construção de um altar de gratidão e ativar o grande arco-íris que atravessa o céu. A contemplação da nova terra encerra a fase.

### Áreas e ambientes do segundo escopo

| Área | Identidade visual e elementos | Criaturas | Função no gameplay |
| --- | --- | --- | --- |
| **Canteiro de Obras no Vale** | Bosques, áreas de corte, rampas de acesso, oficina de carpintaria e estrutura externa da Arca | Aves da região e esquilos | Introduzir o ciclo de coleta, reparo e vedação da madeira |
| **Campo dos Animais** | Vales, colinas, trilhas comportamentais, pontes e acesso à rampa da Arca | Elefantes, girafas, leões, ovelhas, zebras, coelhos e pomba | Guiar famílias de animais em grupos, com interações variadas |
| **Interior da Arca** | Três níveis: convés inferior para grandes animais e suprimentos; convés médio para pequenos mamíferos; convés superior para aves e a família de Noé. Inclui baías, comedouros, feno, lampiões e janelas superiores | Animais embarcados e seus filhotes | Organizar mantimentos e habitats e servir de refúgio durante a tempestade |
| **Monte Ararate e a Nova Terra** | Cume da montanha, solo em secagem, altar de pedras, brotos, ramo de oliveira e céu aberto | Animais desembarcando e pomba | Encerrar a fase de forma contemplativa e celebrar a aliança |

### Objetivos e conclusão da fase

- **Objetivo narrativo:** acompanhar a obediência de Noé, a preservação da vida e a revelação do arco-íris como sinal da promessa de Deus.
- **Objetivo jogável:** preparar a Arca, organizar os mantimentos e a acomodação dos animais, atravessar a tempestade em segurança e contemplar o arco-íris na nova terra.
- **Momento final:** observar a porta da Arca se abrir para uma nova terra e o arco-íris surgir no céu.
- **Mensagem de encerramento:** “O meu arco tenho posto na nuvem; este será por sinal da aliança entre mim e a terra.” — Gênesis 9:13.
- **Gancho para a continuidade:** a vida recomeça na terra e as famílias se espalham, abrindo caminho para novas histórias de fé e sonhos.

### Progresso da jornada

- [ ] O Chamado e o Canteiro
- [ ] A Coleta de Madeira e Betume
- [ ] O Estoque de Mantimentos
- [ ] A Condução dos Animais
- [ ] A Acomodação e o Selah
- [ ] O Fechamento da Porta
- [ ] O Refúgio na Tempestade
- [ ] O Retorno da Pomba
- [ ] A Nova Terra e o Arco-Íris

### Escopo consolidado do Mundo 2

- **9 momentos:** O Chamado; A Coleta e Vedação; O Estoque; A Chegada dos Animais; A Acomodação; O Fechamento da Porta; O Refúgio na Tempestade; O Retorno da Pomba; A Nova Terra e o Arco-Íris
- **4 áreas:** Canteiro de Obras no Vale; Campo dos Animais; Interior da Arca; Monte Ararate e a Nova Terra
- **Gameplay principal:** explorar → coletar → reparar → conduzir → acomodar → contemplar
- **Resumo da jornada:** da obediência ao abrigo → da tempestade à esperança → da esperança à nova aliança

### Questões abertas

- Quais passagens bíblicas oficiais entram em cada momento?

## Mundo 3 — José, o Sonhador: a jornada da superação

### Premissa

José enfrenta desafios e momentos difíceis em uma jornada que termina com perdão e propósito.

### Fantasia do jogador

Acompanhar uma transformação pessoal e narrativa: dos sonhos e adversidades até o Egito e o palácio.

### Gameplay-base

- Resolver desafios inspirados nos sonhos
- Participar de escolhas narrativas adequadas à faixa etária
- Solucionar enigmas
- Percorrer uma jornada até o Egito
- Encontrar passagens e ativar Momentos Selah

### Direção da fase

O mundo deve comunicar dificuldade e superação sem reproduzir conteúdo inadequado de forma explícita. A P.O. definirá quais partes da história aparecem, como serão adaptadas e quais temas sustentam os quizzes.

### Questões abertas

- Quais momentos da vida de José serão jogáveis?
- Como representar sonhos sem confundir narrativa bíblica com previsão pessoal?
- Que escolhas podem existir sem alterar o sentido da história?
- O palácio é o encerramento da fase ou uma área jogável?

## Loop principal

```text
Explorar o mundo
      ↓
Encontrar personagem, tarefa ou passagem
      ↓
Interagir e avançar na história
      ↓
Ativar Momento Selah
      ↓
Ler passagem + responder quiz gerado e validado
      ↓
Entrar na Pausa Selah real
      ↓
Responsável libera a próxima sessão
      ↓
Retomar a jornada
```

## Momento Selah

O Momento Selah é a mecânica que conecta exploração e aprendizagem:

1. Movimento e ações são pausados
2. Música e interface diminuem
3. Uma passagem selecionada pela P.O. é apresentada
4. O NPC virtual informa que usa IA e apresenta um quiz validado
5. A criança escolhe uma alternativa e recebe uma explicação
6. O jogo entra na Pausa Selah real
7. O responsável libera localmente a continuação

O intervalo desejado entre Momentos Selah é de **5 minutos** de exploração.

O jogo nunca bloqueia o navegador ou o aparelho. Fechar a experiência permanece sempre possível, e manter a tela aberta durante a pausa não gera recompensa ou vantagem.

## Uso da inteligência artificial

- A P.O. seleciona as histórias e passagens permitidas
- A LLM gera quizzes somente com base na passagem ativa
- Cada quiz possui quatro alternativas e exatamente uma resposta correta
- O conteúdo passa por validação estrutural, etária e bíblica antes da exibição
- Uma falha de geração resulta em quiz local previamente aprovado
- O NPC é apresentado como personagem virtual automatizado, não como pessoa real ou autoridade divina

## Progresso local

Sem cadastro ou identificação da criança. O navegador pode guardar localmente:

- Mundos e tarefas concluídos
- Passagens coletadas
- Momentos Selah concluídos
- IDs dos quizzes respondidos, alternativa escolhida e resultado

O histórico não é sincronizado com o backend. O responsável pode escolher **Jogar sem salvar** ou **Apagar progresso**.

## Princípios de segurança infantil

- Melhor interesse da criança como padrão de decisão
- Conteúdo previamente selecionado e classificado pela P.O.
- Transparência sobre o uso de IA para criança e responsável
- Ausência de chat aberto e entrada de texto livre
- Sem publicidade comportamental, loot boxes ou recompensa por tempo conectado
- Sem urgência artificial, culpa ou punição por encerrar o jogo
- Controle parental local e redução intencional do tempo contínuo de tela

## Decisões pendentes para a P.O.

- Passagens e tradução de cada mundo
- Recorte exato da história de José
- Objetivo e encerramento da fase 3
- Linguagem das explicações e mensagens dos NPCs fora da Criação
- Regra de liberação e duração da Pausa Selah real
- Critérios de aprovação bíblica e etária dos quizzes
- Ordem definitiva dos mundos e conexão entre eles
