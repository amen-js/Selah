# Creation world asset integration report

Data da auditoria: 2026-08-30  
Escopo: inventário, proveniência, preparação física e manifesto dos assets da
Criação, incluindo os chunks ambientais, a ovelha e o par humano.

## Resultado executivo

O pacote novo usa uma seleção pequena e independente do Kenney Nature Kit 2.1.
Os GLBs foram extraídos sem conversão ou alteração, são Y-up, estão em escala de
metros, usam materiais/cores embutidos e não carregam texturas externas. O
manifesto tipado em src/mapas/criacaoAssets.ts aponta somente para arquivos
presentes em public/models/creation/shared/kenney/.

A segunda seleção usa somente pacotes oficiais CC0 de Quaternius: a ovelha do
Farm Animal Pack conserva dois clips, e os dois Universal Base Characters
conservam seus rigs. Os humanos foram recomprimidos para WebP 1024px para cair
de aproximadamente 31,5 MB para 2,22 MB combinados sem remover geometria ou
skin.

O arquivo fornecido Map by Poly by Google - bU3B6P0ngfi.glb foi auditado, mas
não foi copiado nem colocado no manifesto: apesar de a página de origem declarar
CC BY 3.0 para o modelo, a textura embutida é um mapa-múndi com identificação
Rand McNally e não possui uma licença de redistribuição separada verificável.
Além disso, a geometria é uma placa fina, não um terreno jogável da Criação.

## Fontes e licenças verificadas

### Kenney Nature Kit 2.1 — aprovado

- Página oficial: https://kenney.nl/assets/nature-kit
- Arquivo oficial baixado: kenney_nature-kit.zip
- URL do arquivo:
  https://kenney.nl/media/pages/assets/nature-kit/37ac38a37b-1677698939/kenney_nature-kit.zip
- Tamanho do arquivo: 10.537.521 bytes
- SHA-256 do arquivo: fa7974a0d342bfe63c38664ba9f8ec1a4aab8ea25f099bdc56870e33588c4d9d
- Declaração original em License.txt: Nature Kit 2.1, Kenney, CC0; uso
  pessoal, educacional e comercial permitido; atribuição opcional.
- Licença canônica: https://creativecommons.org/publicdomain/zero/1.0/
- Integridade: unzip -t concluído sem erros.

O License.txt original está retido em
public/models/creation/shared/kenney/License.txt. Os GLBs abaixo são arquivos
originais de Models/GLTF format/, sem otimização destrutiva, renomeação de nós,
recompressão ou mudança de materiais.

### Map by Poly by Google — rejeitado para a Criação

- Página oficial do asset: https://poly.pizza/m/bU3B6P0ngfi
- Download canônico observado na página:
  https://static.poly.pizza/c06cc95b-6a05-469c-aa4a-a44fdac2e9c0.glb
- Criador listado: Poly by Google
- Licença declarada para o modelo: Creative Commons Attribution / CC BY 3.0
- Texto da licença: https://creativecommons.org/licenses/by/3.0/
- SHA-256 do arquivo fornecido e do download canônico:
  aca3349080f1bdff11aa6a7ea3c6c2854008b52ecb4624eefc882724986087d4
- Tamanho: 1.312.000 bytes
- Estrutura: 1 mesh, 2 primitives, 480 triângulos, 2 materiais, 1 node, sem
  bones/animações.
- Bounding box medida: 9,157476 × 0,010062 × 5,865236 m.
- Textura embutida: JPEG 4096 × 2048, 1.300.296 bytes; imagem de mapa-múndi
  com marca/texto Rand McNally.

A atribuição CC BY do modelo não foi tratada como autorização suficiente para
redistribuir o raster de terceiros embutido. O arquivo também não contém
metadata de licença, colisão, anchors ou divisão por chunks. Ele permanece fora
do repositório até existir uma licença verificável para todos os componentes e
uma decisão de design que realmente o use como prop, não como terreno.

### Quaternius Farm Animal Pack — aprovado

- Página oficial: https://quaternius.com/packs/farmanimal.html
- Licença do pacote: CC0 1.0 Universal.
- Arquivo selecionado: `Sheep.fbx`, convertido com FBX2glTF 0.9.7.
- Saída: `sheep.glb`, 153.156 bytes, 610 triângulos, 1 skin.
- Clips preservados: `Armature|Idle` e `Armature|Jump`.
- SHA-256: `d295beed1d28f1eee2af209c637aebaa928a280652040d72627eb84e7f69ffb8`.

### Quaternius Universal Base Characters — aprovado

- Página oficial: https://quaternius.com/packs/universalbasecharacters.html
- Arquivo oficial: edição Standard/free, licença CC0 1.0 Universal.
- `adam.glb`: 963.784 bytes, 14.318 triângulos, 1 skin, SHA-256
  `624475f7e4d5d410286cfe7007301380ddaa4d12d24b9ede63ab73dea2af0b7e`.
- `eve.glb`: 1.259.348 bytes, 15.060 triângulos, 1 skin, SHA-256
  `e59f51bd141eb2d71a712fb3acd8e1869d235833dbdfbbcf6b356d84fd58b0ef`.
- Processamento: glTF-Transform 4.4.2, texturas limitadas a 1024px e WebP 80.
- A edição gratuita não traz clip Idle; o runtime clona os rigs, baixa os
  braços da T-pose e aplica movimento respiratório discreto.

## Inventário preexistente

Estes arquivos já estavam no repositório e não foram duplicados dentro de
public/models/creation/:

| Pacote | Origem/licença | Uso e decisão |
| --- | --- | --- |
| public/models/quaternius/ultimate-stylized-nature/*.glb | Quaternius, CC0, fonte e hash do arquivo-fonte no README do pacote | Já usado por props do mapa; coleções inteiras (0,34–3,40 MB cada) permanecem canônicas para evitar duplicação. Não entram no manifesto novo, pois não são chunks Creation dedicados. |
| public/models/3donimus/nature/nature.glb | 3Donimus via Poly Pizza, CC BY 3.0, metadata no README | Ambiente Hub completo, 66.635 triângulos e sem separação de chunks; não reutilizar como terreno da Criação. |
| public/models/characters/aj/aj.fbx | Arquivo fornecido pelo proprietário, origem/licença marketplace não fornecida | Mantido fora do manifesto por licença não verificável e por ser FBX; requer confirmação de redistribuição antes de entrar em um build. |

## Assets aprovados e mapeamento de slots

Os IDs seguem exatamente AssetCriacaoId. A coluna “carregamento” é a política
para o loader futuro; rios e rios-eden compartilham o mesmo arquivo.

| Momento/slot | Arquivo no manifesto | Tipo | Carregamento | Observação |
| --- | --- | --- | --- | --- |
| ceu-terra-aguas / terreno-criacao | ground_grass.glb | ambiente | momento-ativo | Tile visual 1 m; colisão continua no mapa/runtime. |
| ceu-terra-aguas / rios | ground_riverStraight.glb | ambiente | compartilhado | Tile visual repetível; sem collider. |
| ceu-terra-aguas / montanhas | cliff_large_stone.glb | ambiente | momento-ativo | Peça de relevo de baixa geometria; não é o terreno inteiro. |
| natureza / arvores | tree_default.glb | prop | momento-ativo | Árvore estática. |
| natureza / arbustos | plant_bushDetailed.glb | prop | momento-ativo | Arbusto estático. |
| natureza / flores | flower_purpleA.glb | prop | momento-ativo | Variante roxa no manifesto; variantes vermelha/amarela foram preparadas, mas o contrato tem um único ID. |
| natureza / grama | grass_large.glb | prop | momento-ativo | Cluster estático. |
| criaturas / ovelha | sheep.glb | personagem | momento-ativo | Rig e clip Idle preservados; três instâncias visuais. |
| eden / jardim-eden | platform_grass.glb | ambiente | momento-ativo | Base modular pequena, não um jardim completo. |
| eden / arvore-central | tree_detailed.glb | marco | momento-ativo | Landmark estático provisório. |
| eden / rios-eden | ground_riverStraight.glb | ambiente | compartilhado | Reuso do tile de rios. |
| adao-e-eva / adao | adam.glb | personagem | momento-ativo | Rig humano com pose Idle procedural. |
| adao-e-eva / eva | eve.glb | personagem | momento-ativo | Rig humano com pose Idle procedural. |
| fruto-escolha / arvore-conhecimento | tree_oak.glb | marco | momento-ativo | Árvore genérica CC0; fruto e landmark autoral ainda faltam. |

Os assets aprovados estão em
public/models/creation/shared/kenney/; não há um “mundo inteiro” em um GLB.

## Métricas técnicas dos arquivos referenciados

Bounding boxes abaixo são medidas no espaço local do GLB, em metros. Todos os
arquivos têm 1 mesh, 0 skins, 0 bones, 0 animações, 0 imagens/texturas
externas, root tmpParent e um node visual com o nome original do asset. Não
há nós COL_* ou ANCHOR_*; os arquivos não devem ser usados diretamente como
colliders.

| Arquivo | Bytes | Triângulos | Materiais | Bounding box (X × Y × Z m) | SHA-256 |
| --- | ---: | ---: | ---: | --- | --- |
| ground_grass.glb | 1.576 | 2 | 1 | 1 × 0 × 1 | da741e8ab34ca70c0c85ccda21538558a798188db2f1e265885bcdd226a5cca2 |
| ground_riverStraight.glb | 6.044 | 62 | 4 | 1 × 0,05 × 1 | d1061c7ab8d883fb26177e7cc36b2564b0a437620465c24f1a29629423cda096 |
| cliff_large_stone.glb | 3.564 | 32 | 1 | 1 × 1 × 0,4185 | d63595d0a8727a7a339dd315117fbb85e000224c0add26b6cc907054df046dac |
| tree_default.glb | 9.428 | 114 | 2 | 0,755 × 1,707887 × 0,653849 | 562d29638c902de3c7bee465d3a53bb77117efbc392ae04ed894faf6b5dc691d |
| plant_bushDetailed.glb | 10.172 | 104 | 1 | 0,602544 × 0,360411 × 0,602544 | 2e0487020d68ccf664435db9d829c78ae00e6d2785ee3ec10b9f89cc70a10406 |
| flower_purpleA.glb | 7.112 | 76 | 2 | 0,159098 × 0,2425 × 0,181059 | f6fc34c96a03420a74fe36d4c2d0ec88f15204fcad99cd1416c3c4ecb22e48c4 |
| grass_large.glb | 18.504 | 224 | 1 | 0,408998 × 0,254 × 0,407889 | af49a595624abca7249824eeefb944d4baf974abeeb5b16110d175da3563d6cd |
| platform_grass.glb | 12.568 | 186 | 2 | 0,893197 × 0,0825 × 0,72392 | 74105fc9912c97e7809264dd69621863e0ddfd6ab92136f05918eda436ee898b |
| tree_detailed.glb | 31.412 | 402 | 3 | 0,847115 × 1,332417 × 0,761602 | c041daf2f0fb1d49e4325227cbcd58667adbe51e9b55e8c1f0a94b74cc521b3b |
| tree_oak.glb | 14.644 | 196 | 2 | 0,640554 × 1,22624 × 0,739648 | d7fd8773674928c50c11b66d12c636d49bdcc15a8b1c7fbb98e6f63a3439a3f3 |

Total dos 10 arquivos Kenney únicos referenciados: **115.024 bytes**. Os
materiais Kenney usam dados embutidos no GLB; não foi necessário copiar
texturas sidecar. Somando a ovelha e os dois humanos, os 13 chunks únicos do
manifesto ocupam **2.491.312 bytes**.

### Variantes extraídas, ainda sem slot próprio

Estes arquivos também são íntegros e CC0, mas não são apontados por uma entrada
porque o catálogo atual tem um único ID para cada grupo:

| Arquivo | Bytes | Triângulos | Bounding box (m) | SHA-256 |
| --- | ---: | ---: | --- | --- |
| cliff_top_stone.glb | 5.316 | 53 | 1 × 1 × 0,2685 | 0327759fe95f6be7e263a2f07bf72f212a8df3e16ef1240643f5641a76ec0ec7 |
| flower_redA.glb | 7.104 | 76 | 0,159098 × 0,2925 × 0,181059 | 171930b7789ddbf735af3745576b5393750beb9133b9ff4a444bb6bb2986c020 |
| flower_yellowA.glb | 7.120 | 76 | 0,159098 × 0,1925 × 0,181059 | 8a3b08cd2ca411c21f9c581d5bda651d78b13c50cba45ad8fa0389398ead6d1d |
| grass.glb | 11.496 | 132 | 0,381074 × 0,254 × 0,392183 | 260e41d3e5f2472492ed7b475c5b92a30b13ce2bad408535b5ff50574d4575e7 |
| rock_largeA.glb | 7.552 | 80 | 0,784907 × 0,259776 × 1,015461 | 6dd15390fd96501dcd1454765a17ba61dbbd8d47705dfe5149c8dd92b353ce25 |
| tree_fat.glb | 5.576 | 50 | 0,755 × 1,150387 × 0,653849 | 84b262c5dda3a91ac6c95f9d8b23a0ebbb1951d678c0e1375d3e32623cc43ee2 |
| ground_pathStraight.glb | 5.620 | 62 | 1 × 0,05 × 1 | 86a1e88aaa028ccdfb98b6653c282c6aadb0fbccf9c4de00a834516b9bf79d37 |

## Gaps e responsabilidades de outros pipelines

### Ainda sem asset físico no manifesto

- ambiente-vazio, luz-guia, nucleo-luz,
  marcadores-caminho-luz: VFX/procedural ou arte específica de iluminação.
- lago: água visual dedicada ainda não selecionada; o tile de rio não deve
  ser apresentado como lago sem validação de composição.
- efeito-crescimento: VFX/procedural.
- sol, lua, estrelas, nuvens: conjunto celeste/VFX.
- leao, girafa e sons-animais: ainda sem modelo CC0 oficial verificado nesses
  dois catálogos e sem áudio.
- fruto-nao-interativo: prop com nó de fruto separado.
- animacao-idle-humanos: coberta em runtime pela pose procedural, não por um
  arquivo de modelo inventado.
- Todos os IDs som-*: áudio fora deste pipeline; nenhum caminho de áudio foi
  inventado ou apontado para GLB.

Nenhum substituto foi usado para leão ou girafa: os catálogos oficiais
Kenney/Quaternius auditados não ofereceram esses dois modelos 3D sob a mesma
proveniência CC0 verificável.

### Procedural vs. áudio

Anéis de progressão, luz-guia, pulsos, estrelas, marcadores, água dinâmica,
partículas e efeitos de crescimento devem continuar procedurais até o pipeline
de VFX definir materiais e anchors. Vozes, ambiências, stingers e sons de
animais devem ser entregues pelo pipeline de áudio/Howler. Nenhuma dessas
lacunas é mascarada por arquivos vazios.

## Lazy loading e orçamento por momento

Os 13 arquivos únicos referenciados somam 2.491.312 bytes. Estimativa de
primeira carga por momento, contando cada caminho apenas uma vez:

| Momento | Carga nova aproximada | Arquivos |
| --- | ---: | --- |
| vazio | 0 B | Procedural; nenhum GLB aprovado. |
| luz | 0 B | VFX/procedural. |
| ceu-terra-aguas | 11.184 B | ground grass, river straight, cliff large stone. |
| natureza | 45.216 B | tree default, bush detailed, flower purple A, grass large. |
| ceu-ritmo | 0 B | Celestial procedural; nenhum download de GLB. |
| criaturas | 153.156 B | Ovelha animada; leão e girafa permanecem pendentes. |
| eden | 43.980 B novos | platform grass, detailed tree; river já carregado e compartilhado. |
| adao-e-eva | 2.223.132 B | Adão e Eva, carregados apenas no momento 8. |
| fruto-escolha | 14.644 B | oak tree. |

O loader deve resolver o manifesto por momentoAtualId, deduplicar caminhos
compartilhados e descarregar chunks ao sair da região. Não fazer import estático
dos GLBs no bundle inicial; usar URLs públicas e carregamento sob demanda.

## Riscos técnicos

- Os tiles de solo/rio têm 1 m e não têm espessura útil para colisão. Instanciar
  muitos como colliders aumenta custo e pode gerar frestas; usar colliders
  simples do mapa ou uma etapa posterior com proxies COL_*.
- Os modelos Kenney são estáticos e sem bones/animations. Não são substitutos
  para os animais ou humanos rigados.
- tree_detailed é o maior chunk individual (31.412 B, 402 tri), ainda pequeno
  para web; manter separado como landmark facilita descarte e evita carregar o
  Éden no início.
- Os nomes de node são os nomes originais do pacote (tree_default, etc.), não
  VIS_*; como o manifesto não declara seleção de subnós, o loader deve tratar
  cada arquivo como um GLB visual completo. Uma futura conversão deve validar
  os hashes novamente antes de renomear nós.
- ground_grass possui bbox Y=0; qualquer deslocamento vertical deve ser uma
  decisão do mapa, não uma alteração silenciosa do asset.
- A placa Poly/Google contém textura potencialmente de terceiro e foi mantida
  fora do repo; não reintroduzir sem licença separada verificável.

## Arquivos preparados

- public/models/creation/README.md
- public/models/creation/shared/kenney/README.md
- public/models/creation/shared/kenney/License.txt
- 17 GLBs Kenney em public/models/creation/shared/kenney/ (10 referenciados,
  7 variantes sem slot próprio)
- 1 GLB de ovelha e 2 GLBs humanos Quaternius em
  public/models/creation/shared/quaternius/
- src/mapas/criacaoAssets.ts
- src/mapas/criacaoAssets.test.ts

Validação focada executada: npx vitest run src/mapas/criacaoAssets.test.ts.
As verificações incluem duplicidade/IDs, existência e prefixo de paths, SHA-256
real, licença/proveniência não vazia, momentos válidos, escala/eixo, convenções
de nós, ausência de áudio apontando para GLB e lookup por ID.
