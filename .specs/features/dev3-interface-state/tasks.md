# Dev 3 Interface and State Tasks

**Design:** `.specs/features/dev3-interface-state/design.md`
**Status:** Functional milestone complete; T19 waiting for designer assets; T20 integration complete

## Execution

```text
T1 + T2 -> T3 -> T7 -> T8
T1 + T2 -> T4 -> T5
T3 + T4 -> T12 -> T13
T3 -> T10, T11, T14, T15
T6 -> all UI tasks
T8..T15 -> T16 -> T17 -> T18 -> T20
T16 + designer delivery -> T19 -> T20
```

| ID | Deliverable | Depends on | Tests | Gate | Commit |
| --- | --- | --- | --- | --- | --- |
| T1 | Vitest + RTL harness | None | Smoke | Build | `test(ui): configure frontend test harness` |
| T2 | Shared Selah types | None | Build | Build | `feat(state): define shared Selah contracts` |
| T3 | Zustand store and safe persistence | T1, T2 | Unit | Quick | `feat(state): add persistent game store` |
| T4 | Typed HTTP gateway | T1, T2 | Unit | Quick | `feat(api): add typed Selah gateway` |
| T5 | Lab fixtures and fake gateway | T2, T4 | Build | Build | `test(lab): add Selah fixtures` |
| T6 | Design tokens and accessible global CSS | None | Build | Build | `style(ui): add Selah design tokens` |
| T7 | LanguageSelector | T1, T3, T6 | Component | Quick | `feat(ui): add language selector` |
| T8 | Hud | T1, T3, T6, T7 | Component | Quick | `feat(ui): add game HUD` |
| T9 | DialogBox | T1, T6 | Component | Quick | `feat(ui): add NPC dialog` |
| T10 | Journal | T1, T3, T6 | Component | Quick | `feat(ui): add local journal` |
| T11 | ParentSettings | T1, T3, T6, T7 | Component | Quick | `feat(ui): add parental settings` |
| T12 | useSelahFlow | T1, T3, T4 | Unit | Quick | `feat(selah): add reflection flow controller` |
| T13 | SelahOverlay | T1, T6, T12 | Component | Quick | `feat(selah): add reflection overlay` |
| T14 | ParentalPause | T1, T3, T6 | Component | Quick | `feat(selah): add parental pause screen` |
| T15 | LocalDashboard | T1, T3, T6 | Component | Quick | `feat(metrics): add local dashboard` |
| T16 | GameOverlay composition | T8-T15 | Integration | Full | `feat(ui): compose game overlay` |
| T17 | LabPage | T5, T16 | Integration | Full | `feat(lab): add isolated UI laboratory` |
| T18 | Development-only `/lab` entry | T17 | Integration | Build | `feat(lab): wire development route` |
| T19 | Figma token pass | T6, T16, designer | Browser | Build | `style(ui): apply Selah visual identity` |
| T20 | Cross-team integration and UAT | T18, external handoffs | Full + browser | Build | No commit unless fixed |

## Validation

- Granularity: every code task delivers one component, hook, store, service, or configuration concern.
- Dependency cross-check: the table and execution graph contain the same predecessors.
- Test co-location: store/service/hook/component tests are committed with their implementation.
- Tools: local filesystem/terminal for implementation; in-app browser for UAT.

## Execution Result

- **Complete:** T1-T18 and T20, including all P1 interface/state work, development-only `/lab`, and the Dev 2 HTTP/TTS handoff.
- **Waiting on external input:** T19 cannot be applied because no Figma tokens or assets are present in the repository.
- **Verified:** lint, 115 tests, production build, desktop UAT, mobile UAT, fallback, error handling, and short-hold parental-pause behavior.
- **UAT fixes:** kept the lab HUD below the test controls and stabilized async Selah loading under React StrictMode.
- **Cross-team integration:** aligned the five Creation passage IDs with the Dev 2 allowlist, exercised map → gateway → Hono for every collectible, and verified 115 tests plus the live Vite proxy fallback flow.
