# Handoff — Designer

## Objetivo

Entregar identidade, SVGs e direção visual que permitam aos devs montar rapidamente uma demo infantil legível e coerente. O fluxo principal será usar GPT para gerar conceitos e extrair SVGs editáveis; o Designer revisa, limpa e organiza os vetores antes de entregá-los aos devs. O Designer não precisa escrever componentes React ou 3D.

## Escopo já decidido

- Jornada do produto: **A Criação → Noé e a Arca → José, o Sonhador**.
- Caminho crítico da demo: **A Criação + Momento Selah completo**.
- Noé é condicional; José é expansão pós-demo.
- Estética web 3D leve, adequada a crianças e executável em notebook modesto.
- SVGs gerados com IA precisam de revisão visual, técnica e de proveniência antes de entrar no produto.
- Assets externos devem ser CC0 ou possuir licença compatível e registrada.

## Prioridade 1 — kit visual mínimo em SVG

Gerar e entregar, preferencialmente como SVG:

- paleta principal e cores semânticas;
- tipografia e escala de tamanhos;
- logotipo ou wordmark simples de Selah;
- ícones de interação, áudio, pausa, responsável, progresso e configurações;
- molduras, divisores e ornamentos leves da interface;
- símbolo do versículo colecionável e dos portais;
- elementos visuais do Momento e da Pausa Selah;
- tela inicial;
- HUD de exploração;
- referência visual da tela do responsável.

Figma pode ser usado para composição e validação das telas, mas a entrega principal para ícones, símbolos e ornamentos deve ser vetorial e reutilizável. Para cada elemento interativo, prever estado normal, foco por teclado, hover, pressionado, desabilitado e erro quando aplicável.

## Fluxo GPT → SVG

1. Escrever um prompt com função, estilo, proporção, espessura de traço e restrições de cor.
2. Pedir uma forma simples, sem texto embutido, sombras rasterizadas ou detalhes excessivos.
3. Extrair ou solicitar o SVG vetorial.
4. Abrir e revisar visualmente o resultado.
5. Limpar grupos, metadados, transforms e pontos desnecessários.
6. Confirmar `viewBox`, proporção e comportamento em tamanhos pequenos.
7. Padronizar cores para `currentColor` ou tokens acordados com o Dev3 quando apropriado.
8. Otimizar o arquivo sem alterar sua aparência.
9. Registrar prompt, ferramenta, data e eventuais referências usadas.
10. Entregar ao Dev3 para integração e teste de acessibilidade.

### Requisitos dos SVGs

- não conter imagens raster em base64;
- não depender de fontes externas nem trazer texto convertido sem revisão;
- ter `viewBox` e dimensões previsíveis;
- usar nomes de arquivo em minúsculas, sem espaços e com função clara;
- continuar legível em tamanho pequeno e em fundo claro/escuro;
- não copiar logotipos, personagens protegidos ou o estilo distintivo de um artista vivo;
- não incluir scripts, eventos ou links externos;
- passar por inspeção do código antes da integração.

Antes de criar a pasta final, alinhar com o Dev3 o caminho e a convenção de importação. Sugestão inicial: `src/assets/ui/` para vetores importados como módulos ou `public/assets/ui/` para arquivos servidos diretamente.

## Direção visual de A Criação

A fase deve comunicar a progressão:

```text
vazio e escuridão → luz → natureza → animais → mundo vivo
```

Preparar referências para:

- iluminação e céu em cada etapa;
- terreno, água, vegetação, rochas e animais;
- ponto de entrada do jogador;
- caminho visual até cada colecionável;
- contraste entre exploração e silêncio no Momento Selah;
- hub e portal de retorno.

Evitar excesso de detalhes, partículas ou pós-processamento que prejudiquem leitura e desempenho.

## Assets 3D — apoio secundário

O foco do Designer são os SVGs e a direção visual. Se o Dev1 precisar de apoio para a cena, selecionar modelos prontos de Kenney e Quaternius e organizar em `public/models/` somente depois que o scaffold existir.

Para cada pacote ou modelo, registrar:

| Campo | Exemplo |
| --- | --- |
| Nome | Nature Kit |
| Fonte | URL da página oficial |
| Autor | Kenney |
| Licença | CC0 |
| Arquivo usado | `tree-small.glb` |
| Uso | Região A Criação |

Requisitos:

- preferir `.glb` com poucas texturas e poucos materiais;
- manter nomes de arquivo simples, em minúsculas e sem espaços;
- não editar ou substituir arquivos de outros membros silenciosamente;
- avisar o Dev1 antes de adicionar pacotes grandes;
- não usar asset sem fonte e licença verificáveis.

Não modelar do zero nem tentar converter SVGs de interface em objetos 3D durante a hackathon.

## Level design por dados

O Dev1 fornecerá o tipo e exemplos válidos para os arquivos de mapa. O formato esperado será semelhante a:

```ts
export const props = [
  { modelo: "arvore", pos: [12, 0, -8], rot: 0.4, escala: 1.2 },
  { modelo: "rocha", pos: [-5, 0, 3], rot: 0, escala: 1 },
];
```

Arquivos planejados:

- `src/mapas/criacao.ts` — obrigatório;
- `src/mapas/noe.ts` — somente após aprovação do corte;
- `src/mapas/jose.ts` — pós-demo.

Antes de preencher o mapa, confirmar com o Dev1:

- nomes válidos de modelos;
- unidade e eixos das coordenadas;
- limites jogáveis;
- pontos reservados para spawn, portais e colecionáveis;
- quantidade máxima de objetos;
- quais objetos terão colisão.

Não alterar componentes React/Three.js para ajustar o layout; solicitar ao Dev1 qualquer capacidade que falte no contrato de dados.

## Momento Selah

Entregar uma composição que reduza estímulos:

- foco luminoso no colecionável ou passagem;
- HUD de exploração oculto ou visualmente reduzido;
- tipografia grande e legível;
- alternativas A/B/C/D claramente separadas;
- estados de resposta correta, incorreta e explicação;
- controle de ouvir/pausar TTS;
- transição para a Pausa Selah sem urgência ou recompensa.

Não depender apenas de cor para comunicar estados. Evitar animação contínua intensa, flashes e textos sobre fundos sem contraste.

## Pausa Selah e área do responsável

A tela deve:

- explicar por que a exploração foi pausada;
- convidar à reflexão fora da tela sem culpa;
- deixar claro que o navegador pode ser fechado;
- separar visualmente a ação destinada ao responsável;
- não usar contagem regressiva, streak, prêmio ou urgência;
- prever textos maiores e toque confortável em telas pequenas.

## Checkpoints da hackathon

- **0:30:** estilo, paleta e convenção de SVG alinhados com o Dev3; inventário de proveniência iniciado.
- **1:30:** kit mínimo de SVGs, tipografia e tela inicial entregues.
- **3:00:** `mapas/criacao.ts` preenchido com o Dev1 e fluxo visual da fase revisado.
- **4:00:** arte e estados do Momento/Pausa Selah entregues.
- **4:30:** não iniciar Noé se A Criação ainda precisar de correções.
- **5:45:** congelar alterações; depois disso, apenas apoiar gravação e validação.

## Checklist de aceite

- A direção visual representa a progressão de A Criação.
- O caminho e os cinco colecionáveis são fáceis de perceber.
- Texto, botões e foco têm contraste e hierarquia claros.
- Estados não dependem somente de cor.
- SVGs não contêm raster embutido, scripts ou dependências externas.
- SVGs e assets possuem proveniência e licença registradas quando aplicável.
- A cena respeita o orçamento combinado com o Dev1.
- O Momento Selah parece uma pausa real em relação à exploração.
- O layout principal permanece compreensível em tela menor.

## Interfaces com o time

- **P.O.:** aprova público, conteúdo, tom e recorte narrativo.
- **Dev1:** publica contrato dos mapas, integra assets 3D e informa orçamento de performance.
- **Dev3:** define a convenção de importação, integra os SVGs na UI React DOM e valida estados necessários.
- **Dev2:** informa tamanho e variações reais dos textos e quizzes.

## Fontes internas

- [Game Design Document](../GDD.md)
- [Plano de execução](../../plans/selah.plan.md)
