# Interface Internationalization Tasks

**Design:** `.specs/features/dev3-interface-i18n/design.md`
**Status:** In Progress

## Execution

```text
T1 -> T2 -> T3 -> T4 -> T5 -> T6 -> T7
```

| ID | Deliverable | Depends on | Tests / gate | Commit |
| --- | --- | --- | --- | --- |
| T1 | Typed catalogs, interpolation, fallback, parity tests | None | Unit / quick | `feat(i18n): add typed message catalogs` |
| T2 | Store-backed hook, selector and document locale sync | T1 | RTL + unit / full | `feat(i18n): sync interface language` |
| T3 | App entry, HUD, dialogue, default NPC copy | T2 | RTL / full | `feat(ui): translate game interface` |
| T4 | Journal, dashboard, parental settings | T3 | RTL / full | `feat(ui): translate local panels` |
| T5 | Selah flow errors, overlay states, TTS, parental pause | T4 | Unit + RTL / full | `feat(selah): translate reflection flow` |
| T6 | Development `/lab` structural controls and copy | T5 | Integration / full | `feat(lab): translate UI laboratory` |
| T7 | Literal audit, full gates, three-locale desktop/mobile UAT | T6 | Build + browser | `docs(spec): record interface i18n validation` |

Each task updates its own tests; no test-only deferral, deletion, or skip is allowed. Execution is sequential because the same catalog and component test expectations are shared across tasks.
