# Noah World Progression Tasks

**Spec:** `.specs/features/dev1-noah-world/spec.md`
**Status:** In progress

| ID | Deliverable | Depends on | Focused gate | Status |
| --- | --- | --- | --- | --- |
| N0 | Audit the geometric slice and freeze the nine-moment, Selah, safety, input, area, loading and physics contracts | GDD + current main | Architecture review | Complete |
| N1 | Implement the typed catalogue, pure state machine, versioned checkpoint, R3F bridge, single E/Enter arbiter and explicit Moment 1 completion | N0 | Unit + runtime interaction + lint/build | In progress |
| N2 | Implement Moment 2 collection, access repair and sealing task contracts in the worksite, then gate its approved Selah | N1 | Unit + R3F integration + collider traversal | Pending |
| N3 | Replace or isolate the solid ark/ramp placeholders with navigable, scale-independent worksite geometry and lazy chunks | N1 | Collider/navigation + asset budget | Pending |
| N4 | Implement Moments 3-4 and activate interior/animal-field subscene contracts | N2-N3 | Unit + subscene loading + browser UAT | Pending |
| N5 | Implement Moments 5-7, ordered Selahs, safe-entry gate and derived 33/66/100 weather progression | N4 | Unit + Selah/pause + safety UAT | Pending |
| N6 | Implement Moments 8-9 and activate Ararat/new-land completion | N5 | Unit + checkpoint 9/9 + browser UAT | Pending |
| N7 | Run final Noah accessibility, performance, persistence/reset and end-to-end route UAT | N6 | Focused regression + build + manual UAT | Pending |

## N1 implementation gate

- catalogue contains exactly nine ordered stable IDs and the five approved
  passage mappings;
- reducer accepts only current-moment events, ignores future/duplicate events
  and reconstructs only a canonical checkpoint;
- Noah runtime is inert outside the region and whenever exploration is blocked;
- exactly one candidate wins each E/Enter press, with task > Selah > portal and
  deterministic tie-breaking;
- current five collectibles are no longer simultaneous automatic progression
  triggers;
- current solid ark/ramp placeholders cannot collide with future navigable
  replacements;
- checkpoint is memory-only with save disabled, optional with save enabled and
  fully cleared by reset;
- no backend, UI, narration, TTS or unrelated region file is changed.

## N2 implementation gate

- wood and bitumen requirements, access repair and sealing completion come from
  catalogue data and are idempotent;
- Moment 2 cannot complete before all required local tasks and
  `genesis-6-14` are concluded in order;
- the worksite remains traversable at player scale, including the ramp and ark
  doorway;
- only active worksite chunks load; animal field, interior weather content and
  Ararat remain unloaded;
- child-safety checks prove no timer, failure, threatening urgency, premature
  rain or unrecoverable task state;
- partial N2 progress resumes only when progress saving is enabled and reset
  returns to a clean Moment 1 state.

## Required focused coverage

1. Catalogue, pure state transitions, future-event rejection, idempotency,
   N1/N2 requirements, weather derivation and 9/9 reconstruction.
2. Checkpoint version rejection, count normalization, longest-prefix recovery,
   save-off/save-on behavior and reset.
3. E/Enter repeat and DOM-focus guards, candidate priority, overlap with Selah
   and portal, leave/re-enter rearm and exploration-blocked behavior.
4. Selah conclusion versus quiz history, parental-pause release and
   current-moment collectible gating.
5. Worksite chunk selection, absence of future asset fetches, unique asset IDs,
   scale-independent colliders, clear spawn and traversable ramp/doorway.
6. Focused Hub -> Noah -> Hub resume and Moment 1 -> partial Moment 2 route.

No implementation is claimed by this task plan. Only N0 is complete; N1 is the
active implementation block.
