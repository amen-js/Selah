# Handoff — P.O.

## Objetivo

Garantir que a demo conte uma história bíblica adequada para crianças, com decisões de produto claras e conteúdo previamente aprovado. A P.O. define **o que** entra; os devs e o designer definem **como** implementar.

## Escopo já decidido

- Jornada do produto: **A Criação → Noé e a Arca → José, o Sonhador**.
- Caminho crítico da hackathon: **A Criação + Momento Selah completo**.
- Noé entra somente se a jornada principal estiver estável.
- José permanece como expansão pós-demo.
- Sem chat aberto, cadastro infantil ou coleta de dados pessoais.
- A IA gera apenas quizzes baseados em passagens previamente aprovadas.
- A Pausa Selah bloqueia somente a exploração; nunca o navegador ou o aparelho.

## Entregas bloqueadoras — primeiros 30 minutos

### 1. Público e linguagem

Definir e comunicar ao time:

- faixa etária inicial;
- nível de leitura esperado;
- idioma e tradução bíblica da demo;
- tom das mensagens para criança e responsável;
- se TTS será obrigatório para o público escolhido.

### 2. Recorte de A Criação

Entregar um fluxo curto com:

- eventos bíblicos que aparecem, em ordem;
- ações da criança em cada evento;
- objetivo final da fase;
- condição de conclusão;
- cinco passagens candidatas a colecionáveis;
- temas permitidos para os quizzes.

Decidir especialmente se a criança apenas presencia a criação ou ajuda simbolicamente a revelar luz, natureza e animais.

### 3. Curadoria das passagens

Preencher uma linha para cada passagem aprovada:

| Campo | Conteúdo esperado |
| --- | --- |
| `historiaId` | `criacao`, `noe` ou `jose` |
| Referência | Livro, capítulo e versículos |
| Tradução/idioma | Versão autorizada e idioma |
| Faixa etária | Público para o qual foi aprovada |
| Tema | Ideia que o quiz pode explorar |
| Uso | Colecionável, missão ou desafio final |
| Restrições | Assuntos ou interpretações a evitar |
| Status | `aprovada`, `revisar` ou `não usar` |

O Dev2 só integra referências com status `aprovada`. A licença da tradução deve permitir o uso pretendido; snapshots offline só podem ser feitos quando expressamente autorizados.

## Conteúdo narrativo e IA

### Voz do narrador virtual

Definir:

- personalidade e vocabulário;
- exemplos de saudação, orientação e encerramento;
- como ele informa que é um personagem automatizado que usa IA;
- assuntos, afirmações e tons que devem ser evitados;
- como se refere a Deus e ao texto bíblico sem se apresentar como autoridade divina.

### Quizzes de fallback

Para cada uma das cinco passagens prioritárias, aprovar pelo menos:

- uma pergunta;
- quatro alternativas A/B/C/D;
- exatamente uma resposta correta;
- uma explicação curta e adequada à faixa etária;
- a referência que sustenta a resposta.

O fallback é obrigatório para a demo sem internet e para qualquer resposta inválida da IA.

### Critérios de reprovação

Registrar quando um quiz deve ser descartado, incluindo:

- informação não sustentada pela passagem;
- ambiguidade ou mais de uma resposta correta;
- linguagem inadequada para a idade;
- medo, culpa, urgência ou punição emocional;
- interpretação bíblica não aprovada;
- afirmação do NPC como pessoa real ou autoridade divina.

## Momento e Pausa Selah

Definir antes da integração final:

- intervalo desejado entre Momentos Selah;
- texto apresentado à criança antes e depois do quiz;
- o que será lido por TTS;
- regra local de liberação pelo responsável;
- mensagem da tela de pausa;
- se existe duração mínima e qual é;
- como explicar que fechar o jogo é sempre permitido.

A pausa não pode oferecer recompensa por deixar a tela aberta, usar contagem regressiva manipulativa ou enviar PIN, horário ou configuração parental ao backend.

## Checkpoints da hackathon

- **0:30:** público, recorte de A Criação e referências prioritárias definidos.
- **1:30:** cinco colecionáveis aprovados; decidir movimento cinemático se o personagem ainda não andar.
- **3:00:** voz do narrador e quizzes de fallback revisados; recorte de Noé iniciado.
- **4:00:** testar o Momento Selah como criança, responsável e criança que ainda não lê.
- **4:30:** cortar Noé se A Criação não estiver fluida.
- **5:45:** congelar o código sem exceção.
- **6:15–7:00:** reservar o período para o pitch; roteiro e ensaios serão definidos separadamente.

## Teste de aceite da P.O.

- A criança entende o objetivo sem ajuda técnica.
- O texto e o quiz correspondem à passagem aprovada.
- Existe exatamente uma alternativa correta.
- O NPC deixa claro que usa IA.
- TTS permite acompanhar o momento sem saber ler.
- A Pausa Selah pode ser liberada localmente pelo responsável.
- É possível jogar sem salvar e apagar o progresso.
- A experiência funciona com o Wi-Fi desligado.
- Não há culpa, urgência artificial ou incentivo a permanecer conectado.

## Pitch

O pitch foi separado deste handoff para que as ideias da P.O. sejam desenvolvidas sem misturar decisões de produto com roteiro de apresentação. Usar o [rascunho de pitch](PITCH.md) quando chegar a hora.

## Fora da responsabilidade da P.O.

- implementar engine, interface ou backend;
- escolher bibliotecas e arquitetura;
- configurar OpenRouter ou YouVersion;
- posicionar assets no mapa;
- assumir tarefas técnicas que desviem o foco de curadoria, aceite e cronograma.

## Fontes internas

- [Game Design Document](../GDD.md)
- [Plano de execução](../../plans/selah.plan.md)
- [Rascunho de pitch](PITCH.md)
