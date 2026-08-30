# Dev 2 Frontend Integration Specification

**Date:** 2026-08-30
**Status:** Verified

## Problem

The production overlay already targets the Dev 2 HTTP gateway, but the Creation
map still emits provisional OSIS references that are not accepted by the proxy
allowlist. The merged application also mounts the Selah audio hook twice.

## P1: Complete the production Selah vertical slice

**User story:** As a player, I want every Creation collectible to open a real
verse and quiz so that the full Selah flow works outside the isolated UI lab.

### Acceptance criteria

1. **INT-01:** WHEN any Creation collectible opens a Selah THEN its `passagemId`
   SHALL be accepted by the Dev 2 allowlist.
2. **INT-02:** WHEN the frontend gateway loads a collectible THEN the Dev 2 Hono
   app SHALL return a public verse and exactly four quiz alternatives without an
   answer key or pre-answer explanation.
3. **INT-03:** WHEN the player answers the quiz THEN the frontend SHALL submit
   only `quizId` and `alternativaId` and receive the server evaluation.
4. **INT-04:** WHEN the production `GameOverlay` mounts THEN it SHALL use the real
   relative HTTP gateway and the Dev 2 TTS controller by default, while `/lab`
   SHALL continue injecting deterministic fixtures.
5. **INT-05:** WHEN the application mounts THEN the Selah ambient-audio hook
   SHALL be mounted exactly once.

## Out of scope

- Changing the Dev 2 endpoint schemas, allowlist, prompts, or curated content.
- Moving server fallback content into the browser bundle.
- Replacing the isolated `/lab` gateway with network requests.
- Adding deploy infrastructure or API credentials.

## Verification

- Cross-layer test: Creation map → `createSelahGateway` → `createApp`.
- Component test proving a single Selah audio hook mount.
- `npm run lint`, `npm run test:run`, and `npm run build`.
- Browser UAT against the local Vite proxy and Hono fallback data.

## Traceability

| Requirement | Verification | Status |
| --- | --- | --- |
| INT-01 | Creation map unit + cross-layer test | Verified |
| INT-02 | Cross-layer test + live proxy smoke | Verified |
| INT-03 | Cross-layer test + live proxy smoke | Verified |
| INT-04 | Existing `GameOverlay` and `/lab` integration tests | Verified |
| INT-05 | `App` integration test | Verified |

## Validation result

- All five Creation triggers completed verse, fallback-quiz, and evaluation
  requests through the real frontend gateway and Hono app in the cross-layer test.
- The live Vite proxy returned health, the approved `genesis-1-24` snapshot, a
  four-alternative fallback quiz, and the correct server evaluation with both
  external API keys disabled.
- `/lab` remained on its injectable fixture gateway and the production overlay
  retained the real gateway and TTS defaults.
- Gate after integrating the Selah engine delivery: 28 test files and 115 tests
  passed; lint and production build passed.
- Test integrity: one cross-layer test added, no tests removed or skipped.
