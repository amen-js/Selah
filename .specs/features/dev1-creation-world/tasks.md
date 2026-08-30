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
| T6 | Replace provisional map with optimized 3D chunks | Final assets | Browser + performance | Pending |
| T7 | Full Creation route UAT, performance and accessibility pass | T4-T6 | Full | Pending |

T2 keeps progression rules pure. T3 stores only two local checkpoints in the
shared store: explicitly concluded Selah passage IDs and the canonical prefix of
completed Creation moments. This is required because answer history is not
completion and spatial/final beats cannot be reconstructed from quiz responses.
Both checkpoints persist only when the responsible adult enables progress
saving.

T6 is isolated behind the typed asset IDs and manifest contract so an external
asset branch can prepare licensed GLBs without editing the progression runtime.
