# Creation World Progression Tasks

**Spec:** `.specs/features/dev1-creation-world/spec.md`
**Status:** In progress

| ID | Deliverable | Depends on | Gate | Status |
| --- | --- | --- | --- | --- |
| T1 | GDD progression spec and prioritized asset manifest | GDD | Review | Complete |
| T2 | Typed nine-moment catalogue and pure state machine | T1 | Unit | Complete |
| T3 | R3F bridge for movement, zones and completed Selahs | T2 | Unit + build | Complete |
| T4 | Smooth atmosphere, gated interactions and per-moment reveal hooks | T3 | Browser | Ready for UAT |
| T5 | Voice Guide dialogue/narration integration | T3, approved localized scripts | Browser | Ready for specification — OpenRouter TTS selected |
| T6 | Replace provisional map with optimized 3D chunks | Final assets | Browser + performance | Ready for UAT |
| T7 | Full Creation route UAT, performance and accessibility pass | T4-T6 | Full | Ready for UAT |

T2 keeps progression rules pure. T3 stores only two local checkpoints in the
shared store: explicitly concluded Selah passage IDs and the canonical prefix of
completed Creation moments. This is required because answer history is not
completion and spatial/final beats cannot be reconstructed from quiz responses.
Both checkpoints persist only when the responsible adult enables progress
saving.

T6 is isolated behind the typed asset IDs and manifest contract so an external
asset branch can prepare licensed GLBs without editing the progression runtime.

## Bloco de assets e composição — evidência de saída

T6 está pronto para UAT com quatro biomas determinísticos (Campo da Criação,
Vale das Águas, Bosque da Vida e Jardim do Éden), chunks GLB independentes,
ovelha Quaternius e personagens/visuais procedurais autorais. Adão e Eva são
descritos por `characters/*.model.json`; os GLBs Quaternius correspondentes são
apenas fontes auditadas e não são carregados.

O orçamento focado cobre 13 arquivos físicos únicos em 14 entradas, com apenas
o reuso compartilhado esperado do tile de rio. Os limites são 1,5 MB por
arquivo/momento e 3 MB para a biblioteca. Foram executados 9 arquivos/56 testes
focados (manifesto, orçamento, biomas, detalhes, elementos, portais,
coletáveis, progressão e reduced-motion), além do lint final e do build de
produção; a inspeção visual no browser passou pelos quatro biomas, leão/girafa,
Éden e frutos. T7 está pronto para a UAT manual completa do usuário, incluindo
rota, performance e acessibilidade. Nenhuma suíte completa é declarada como
executada.
