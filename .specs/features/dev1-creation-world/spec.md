# Creation World Progression Specification

## Goal

Turn the nine Creation moments approved in `docs/GDD.md` into a deterministic,
data-driven 3D progression that can be developed before final art arrives.

## Requirements

1. **CRE-01:** The Creation journey SHALL expose the nine GDD moments in their
   approved order: void, light, sky/land/water, nature, celestial rhythm,
   creatures, Eden, Adam and Eve, and the choice.
2. **CRE-02:** Every moment SHALL declare its own completion trigger as data.
   Supported triggers are travelled distance, narrative zone and completed
   Selah passage.
3. **CRE-03:** Runtime events SHALL only complete the current moment. A player
   SHALL NOT skip moments by reaching a later zone or passage early.
4. **CRE-04:** A Selah trigger SHALL count only after the Selah feedback is
   concluded and the parental pause is released. A quiz response in local
   history SHALL NOT advance the Creation narrative by itself.
5. **CRE-05:** Re-entering Creation SHALL restore the exact canonical checkpoint,
   including spatial beats and 9/9 completion. The checkpoint SHALL remain only
   in memory while playing without save and SHALL persist only when local
   progress saving is enabled.
6. **CRE-06:** The engine SHALL expose the active moment and scene phase so that
   future environment chunks, effects, narration and UI can subscribe without
   changing progression rules.
7. **CRE-07:** The implementation SHALL remain inside the local 3D/gameplay
   scope. It SHALL NOT change backend, quiz generation, TTS or remote API
   contracts.
8. **CRE-08:** Creation progression SHALL be inert outside the Creation region
   and while exploration is blocked.
9. **CRE-09:** Final art SHALL be loaded as per-moment or per-biome chunks. The
   complete multi-world asset library SHALL NOT mount at application startup.
10. **CRE-10:** Creation collectibles from future moments SHALL remain hidden
    until their declared moment, while previously released collectibles remain
    available.
11. **CRE-11:** Cancelling an unanswered Selah SHALL allow a new attempt after
    the player leaves and re-enters its activation radius.
12. **CRE-12:** Creation crystals and narrative zones SHALL require an explicit
    E/Enter interaction after entering their radius; proximity alone SHALL NOT
    advance the journey.
13. **CRE-13:** Transient narrative cues SHALL disappear after their beat while
    revealed environment chunks remain cumulative.

## First implementation slice

- typed catalogue for all nine moments and their GDD guide copy;
- pure, tested sequential state machine;
- exact reconstruction from the canonical completed-moment checkpoint, with a
  legacy fallback from explicitly concluded Selahs;
- R3F runtime bridge for player distance, zones and completed Selahs;
- current-moment collectible gating and diegetic markers for narrative zones;
- typed persistent environment reveal plus beat-scoped VFX contracts.

## Out of scope for this slice

- final 3D environment and character assets;
- localized recorded narration;
- new backend or remote persistence;
- Noah, Joseph, backend, quiz or TTS behavior;
- touching or controlling the forbidden fruit.

## Validation

- unit tests cover the catalogue, valid progression, ignored future events,
  idempotency, final completion and reconstruction;
- existing map, Selah, portal, store and UI tests remain green;
- lint and production build pass.
