# Responsible Onboarding Tasks

**Spec:** `.specs/features/dev3-responsible-onboarding/spec.md`  
**Status:** In progress

| ID | Deliverable | Depends on | Tests / Gate | Status | Commit |
| --- | --- | --- | --- | --- | --- |
| T1 | Persisted onboarding completion contract | None | Store unit / quick | Complete | `feat(state): add responsible onboarding state` |
| T2 | Accessible localized onboarding screen | T1 | Component + i18n / full | Complete | `feat(ui): add responsible onboarding` |
| T3 | First-run game-entry integration | T2 | App integration / full | Complete | `feat(app): require responsible setup before play` |
| T4 | Build gate and desktop/mobile UAT | T3 | Build + browser | In progress | `docs(spec): verify responsible onboarding` |

## Execution Notes

- T1 changes only the store contract and store tests.
- T2 adds one component, its tests, catalog copy, and scoped styles.
- T3 composes the component in `App` and updates integration tests.
- T4 records traceability, automated gate results, and visual UAT evidence.
