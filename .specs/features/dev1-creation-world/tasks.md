# Creation World Progression Tasks

**Spec:** `.specs/features/dev1-creation-world/spec.md`
**Status:** In progress

| ID | Deliverable | Depends on | Gate | Status |
| --- | --- | --- | --- | --- |
| T1 | GDD progression spec and prioritized asset manifest | GDD | Review | Complete |
| T2 | Typed nine-moment catalogue and pure state machine | T1 | Unit | Complete |
| T3 | R3F bridge for movement, zones and completed Selahs | T2 | Unit + build | Complete |
| T4 | Smooth atmosphere and per-moment reveal hooks | T3 | Browser | In progress |
| T5 | Voice Guide dialogue/narration integration | T3, localized copy/audio | Browser | Pending |
| T6 | Replace provisional map with optimized 3D chunks | Final assets | Browser + performance | Pending |
| T7 | Full Creation route UAT, performance and accessibility pass | T4-T6 | Full | Pending |

T2 and T3 intentionally avoid the shared store: answered passage IDs already
provide the persistent milestones required to reconstruct safe progress.
