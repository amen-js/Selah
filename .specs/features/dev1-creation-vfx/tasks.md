# Creation Procedural VFX Tasks

**Spec:** `.specs/features/dev1-creation-vfx/spec.md`
**Visual Direction:** `.specs/features/dev1-creation-vfx/visual-direction.md`
**Status:** Complete

| ID | Deliverable | Depends on | Gate | Status |
| --- | --- | --- | --- | --- |
| V1 | Define procedural visual direction and specs | GDD | Review | Complete |
| V2 | Implement light and growth procedural effects (`ambiente-vazio`, `luz-guia`, `nucleo-luz`, `marcadores-caminho-luz`, `efeito-crescimento`) | V1 | Unit | Complete |
| V3 | Implement celestial procedural effects (`sol`, `lua`, `estrelas`, `nuvens`) and root `EfeitosCriacao` | V2 | Unit + R3F | Complete |
| V4 | Unit tests for configuration, determinism, IDs, reduced-motion, and budgets | V3 | Test run + build | Complete |
