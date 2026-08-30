# Noah World Progression Specification

**Owner:** Dev 1
**Status:** Foundation in progress
**Source:** `docs/GDD.md`, Mundo 2

## Goal

Turn the nine approved moments of Noah's journey into a deterministic,
child-safe and data-driven 3D progression. N1 and N2 establish the local
gameplay foundation without changing backend, interface or narration
contracts.

## Approved journey catalogue

The catalogue order and the five Selah mappings below are canonical. A later
moment cannot become available or complete before the current moment.

| Order | Stable moment ID | GDD moment | Completion contract | Approved Selah passage |
| --- | --- | --- | --- | --- |
| 1 | `chamado-canteiro` | O chamado e o canteiro de obras | Explicit local interaction | — |
| 2 | `coleta-vedacao` | A coleta de materiais e a impermeabilização | Required local tasks, then completed Selah | `genesis-6-14` |
| 3 | `estoque-mantimentos` | O estoque de mantimentos | Explicit local tasks | — |
| 4 | `conducao-animais` | A chegada e a condução dos animais | Explicit local tasks | — |
| 5 | `acomodacao-animais` | A acomodação e os Momentos Selah | Required local tasks, then completed Selah | `genesis-6-19` |
| 6 | `fechamento-porta` | A mudança do clima e a entrada no abrigo | Required local sequence, then completed Selah | `genesis-7-1` |
| 7 | `refugio-tempestade` | O refúgio durante a tempestade | Required local tasks, then completed Selah | `genesis-8-1` |
| 8 | `retorno-pomba` | A pomba e o ramo de oliveira | Explicit local tasks | — |
| 9 | `nova-terra-arco-iris` | A nova terra e o arco-íris | Required local sequence, then completed Selah | `genesis-9-13` |

A quiz answer or history entry is not a completed Selah. Only the existing
explicitly concluded Selah checkpoint may satisfy a Selah gate, and only after
the parental pause has been released.

## Functional requirements

1. **NOA-01:** A typed catalogue SHALL expose exactly the nine moments above,
   in the approved order, with stable IDs, area, local task contract and
   optional Selah passage.
2. **NOA-02:** A pure state machine SHALL own Noah progression. Runtime events
   SHALL only affect the current moment, SHALL be idempotent and SHALL NOT skip
   moments.
3. **NOA-03:** N1 SHALL establish the catalogue, pure state machine, checkpoint
   normalization, R3F bridge and explicit completion of `chamado-canteiro`.
4. **NOA-04:** N2 SHALL establish the first playable task slice for
   `coleta-vedacao`: collect the declared wood and bitumen requirements, repair
   the access and complete the sealing task before its Selah can conclude the
   moment. Exact counts SHALL be catalogue data, not duplicated runtime
   constants.

For the first playable slice, the catalogue fixes those recoverable,
child-sized requirements at four plank pickups, one ramp repair and three hull
seams. The GDD defines the activities but not their counts; these values keep
the slice legible without turning it into repetitive collection.
5. **NOA-05:** Noah progression SHALL be inert outside the Noah region and
   while exploration is blocked by Selah, parental pause, an open overlay or a
   portal transition.
6. **NOA-06:** Proximity SHALL only select a candidate. An action, Selah or
   portal SHALL activate only after one non-repeated `E` or `Enter` press.
7. **NOA-07:** A single Noah interaction arbiter SHALL resolve all nearby
   candidates. The deterministic priority is local task, then Selah, then
   portal; ties use distance and stable ID. One key press SHALL execute at most
   one candidate.
8. **NOA-08:** Key confirmation SHALL reuse the existing DOM-focus and repeat
   guards so Enter on an interactive interface control never reaches the 3D
   world.
9. **NOA-09:** The five existing Noah collectibles SHALL be hidden or inert
   until their mapped moment. They SHALL require explicit interaction and SHALL
   NOT all remain simultaneously automatic.
10. **NOA-10:** Weather SHALL be a derived consequence of completed preparation
    tasks. Visual milestones SHALL be 33%, 66% and 100%; there SHALL be no
    timer, failure, threatening urgency or rain before every preparation
    requirement and safe entry are complete.
11. **NOA-11:** The experience SHALL not punish delay, strand the child, use
    frightening thunder or imply that the player replaces Noah. Tasks SHALL be
    cooperative, recoverable and safe to retry.
12. **NOA-12:** Noah SHALL declare four logical areas: worksite valley, animal
    field, three-level ark interior, and Ararat/new land. Area and spawn
    contracts SHALL exist before later moments require subscene transitions.
13. **NOA-13:** N1/N2 SHALL mount only the worksite subscene. Future area
    assets SHALL NOT be fetched, preloaded or mounted before their area and
    moment are active.
14. **NOA-14:** Static scenery MAY remain in the region map shell. Interactive,
    task-owned or moment-gated objects SHALL live in a Noah world layer rather
    than the generic static `MapaRegiao.props` collection.
15. **NOA-15:** Asset chunks SHALL declare stable ID, area, minimum moment,
    source file, fallback and collider descriptor. Each chunk SHALL suspend
    independently; the complete Noah asset library SHALL NOT load at startup.
16. **NOA-16:** Visual scale and physics dimensions SHALL be independent. The
    ark SHALL use explicit compound colliders with a traversable doorway, and
    the ramp SHALL use a traversable slope collider. The full ark SHALL NOT use
    one automatic solid hull, trimesh or cuboid.
17. **NOA-17:** When the new Noah world layer is enabled, the current solid
    geometric ark and ramp SHALL be filtered or disabled so visual and physics
    bodies are not duplicated.
18. **NOA-18:** The canonical Noah checkpoint SHALL be versioned and SHALL
    contain the valid completed-moment prefix plus normalized partial task
    progress. It SHALL remain in memory when progress saving is off and persist
    locally only when the responsible adult enables progress saving.
19. **NOA-19:** Hydration SHALL reject unknown IDs, versions and impossible
    counts, restoring the longest valid canonical prefix. Reset SHALL restore
    moment 1, clear partial tasks and remove the persisted Noah checkpoint.
20. **NOA-20:** Reduced-motion preferences SHALL disable or simplify optional
    movement without changing task reachability, interaction or completion.

## Architecture for N1 and N2

```text
src/components/game/noe/
  progression/
    types.ts          # catalogue, state, events and checkpoint types
    catalogo.ts       # nine moments and task/Selah contracts
    estado.ts         # pure reducer and derived weather milestones
    checkpoint.ts     # versioned normalization and reconstruction
  runtime/
    ProgressaoNoeRuntime.tsx  # R3F/store bridge, no progression rules
    InteracaoNoeRuntime.tsx   # one E/Enter arbiter for Noah candidates
  world/
    MundoNoe.tsx      # active subscene and moment composition
    ElementosNoe.tsx # task-owned and gated scene elements
    assets.ts         # lazy chunk manifest
    colliders.ts      # explicit, scale-independent physics descriptors
```

The state machine accepts catalogue-allowlisted task-unit events and a final
`selah-concluido`. Stable unit IDs make retries idempotent and let the versioned
checkpoint reject invented or excessive counts. R3F components detect
proximity and publish candidates, but do not decide progression. The runtime
bridge emits an event only after the interaction arbiter has accepted the
active candidate.

The initial four-area contract is:

| Area ID | Subscene | First required moment |
| --- | --- | --- |
| `canteiro-vale` | Exterior worksite and ark access | 1 |
| `campo-animais` | Animal paths and boarding access | 4 |
| `interior-arca` | Three logical decks | 3 |
| `ararate-nova-terra` | Landing, altar and covenant landscape | 9 |

The ordering above identifies first data dependency, not mandatory travel
order. N1/N2 only implement `canteiro-vale`; later slices decide transitions
without changing moment IDs or the pure reducer.

## Current P0 blockers

1. **Simultaneous automatic Selahs:** the current map exposes all five Noah
   collectibles, while the region enables proximity activation by default.
   N1 SHALL gate them by the approved catalogue and route them through the
   single explicit interaction arbiter.
2. **Solid ark and ramp:** the current geometric ark and ramp are solid cuboids
   at a small placeholder scale. N1/N2 SHALL isolate those placeholders before
   mounting navigable replacements; duplicate visual or collision bodies are
   not acceptable.

## Team boundaries

- **Dev 1 owns:** Noah's local 3D catalogue, pure progression, R3F bridge,
  interaction candidates and arbiter, world/subscene composition, lazy asset
  manifest, colliders, local checkpoint contract and focused gameplay tests.
- **Dev 2 owns:** Hono routes, YouVersion/OpenRouter integration, allowlists,
  quiz generation, curated passage payloads, caching and remote service
  behavior. This slice freezes passage IDs but does not change those services.
- **Dev 3 owns:** DOM prompts and HUD, Selah/parental-pause interface, narrated
  guide, localization, TTS/audio and responsible-adult settings. Dev 1 consumes
  existing exploration-block and concluded-Selah contracts without changing
  their visible behavior.

N1/N2 SHALL NOT modify backend, Selah overlay, guide UI, narration, TTS, remote
persistence or passage copy. Cross-team changes require a separate spec and PR.

## Definition of done

- the nine-moment catalogue and five Selah mappings match this specification;
- the reducer is pure, sequential, idempotent and fully covered by focused unit
  tests, including N1/N2 task requirements and final 9/9 reconstruction;
- one E/Enter press activates exactly one Noah candidate and respects repeat,
  DOM-focus, overlay, pause and portal-transition guards;
- future Selahs, areas and chunks remain unavailable and unloaded;
- the worksite spawn, task objects, ark doorway and ramp are traversable and do
  not overlap the portal or duplicate current placeholder colliders;
- save-off, save-on resume, malformed checkpoint recovery and reset are covered
  by focused tests;
- weather derivation proves 33/66/100 milestones and proves rain cannot start
  before preparation and safe entry are complete;
- reduced-motion behavior preserves every required interaction;
- only focused Noah, interaction, portal, store and collider tests plus lint of
  touched files and a production build are required before merge. A full test
  suite is not a gate for N0 documentation.

## Out of scope

- implementing moments 3 through 9 in N1/N2;
- final character art, animal behavior, touch sealing UI or production weather
  effects;
- guide dialogue, copy, voice, TTS, translations or new HUD;
- backend, allowlist, quiz, remote API or analytics changes;
- refactoring Creation or every region into the Noah interaction arbiter.
