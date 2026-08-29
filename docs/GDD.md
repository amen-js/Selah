# Selah — Game Design Document

> Status: rascunho inicial para evolução conjunta com a P.O.  
> Este documento descreve o jogo e sua experiência. Stack, responsáveis e cronograma permanecem no plano de execução.

## Visão do jogo

**Selah** é um jogo bíblico 3D de exploração para crianças. Cada mundo transforma uma história selecionada pela equipe em uma jornada interativa de descoberta, missão e reflexão.

A experiência alterna entre movimento e pausa: a criança explora, interage com a narrativa e encontra passagens bíblicas; no **Momento Selah**, o ritmo desacelera para leitura e um quiz contextual. Ao final, a **Pausa Selah real** interrompe a exploração até a liberação do responsável, levando a proposta de pausa para fora da tela.

## Público inicial

- Crianças em faixa etária a ser definida pela P.O.
- Experiência acompanhada por pais ou responsáveis
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

Estar presente no início de um mundo vazio que progressivamente se enche de luz, cor, movimento e vida.

### Gameplay-base

- Explorar o ambiente à medida que ele se transforma
- Descobrir novos elementos da criação
- Interagir com luz, natureza e animais
- Observar mudanças visuais e sonoras entre cada momento
- Encontrar passagens e ativar Momentos Selah

### Direção da fase

A progressão deve ser marcada por contraste: vazio e preenchimento, escuridão e luz, silêncio e vida. A ordem exata dos eventos, as passagens e a forma de participação da criança serão definidas pela P.O.

### Questões abertas

- Quais momentos da criação serão jogáveis?
- A criança apenas testemunha ou ajuda simbolicamente a revelar elementos?
- Qual é o objetivo final da fase?
- Quais animais e biomas entram no primeiro escopo?

## Mundo 2 — Noé e a Arca: a grande missão

### Premissa

Noé recebe uma grande tarefa e precisa se preparar antes da chuva.

### Fantasia do jogador

Participar de uma missão com objetivo claro, ajudando Noé a preparar a arca e cuidar dos animais antes da tempestade.

### Gameplay-base

- Coletar materiais necessários para a missão
- Ajudar a conduzir e organizar os animais
- Resolver tarefas de preparação da arca
- Entrar na arca antes da tempestade
- Encontrar passagens e ativar Momentos Selah

### Direção da fase

A aproximação da chuva cria progressão narrativa e mudança de atmosfera, mas não deve usar pressão excessiva, punição emocional ou urgência manipulativa. A criança precisa compreender a missão sem ser colocada em estado de ansiedade.

### Questões abertas

- A chuva começa por evento narrativo ou após todas as tarefas?
- Quais materiais serão coletados?
- Como os animais serão agrupados sem transformar a missão em repetição?
- Haverá exploração dentro da arca?

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

- Faixa etária inicial
- Passagens e tradução de cada mundo
- Recorte exato das três histórias
- Objetivo e encerramento de cada fase
- Linguagem das explicações e mensagens dos NPCs
- Duração desejada entre Momentos Selah
- Regra de liberação e duração da Pausa Selah real
- Critérios de aprovação bíblica e etária dos quizzes
- Ordem definitiva dos mundos e conexão entre eles
