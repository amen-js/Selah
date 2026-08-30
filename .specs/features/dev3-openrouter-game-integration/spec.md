# OpenRouter Game Integration Specification

**Date:** 2026-08-30
**Status:** Verified

## Problem

PR 25 added OpenRouter quiz generation grounded in YouVersion text, but the
existing cross-layer game test only exercises the approved local fallback. The
game needs executable proof that the player's AI preferences reach the proxy and
that an AI-generated quiz can complete the same public flow without exposing its
answer key.

## P1: Complete the OpenRouter game vertical slice

**User story:** As a player, I want an enabled AI reflection to use the
OpenRouter quiz through the normal Selah flow so that generated questions work
inside the game exactly like reviewed fallback questions.

### Acceptance criteria

1. **ORI-01:** WHEN a Selah starts THEN the game SHALL send the current language,
   age group, derived difficulty, and AI preference to the quiz gateway.
2. **ORI-02:** WHEN AI is enabled and OpenRouter returns a valid grounded quiz
   THEN the game gateway SHALL receive four public alternatives with
   `origem: "ia"` and without an answer key or pre-answer explanation.
3. **ORI-03:** WHEN the player answers an AI-generated quiz THEN the game SHALL
   submit only `quizId` and `alternativaId` and receive the server evaluation.
4. **ORI-04:** WHEN OpenRouter rejects JSON Schema but accepts JSON Object THEN
   the server SHALL retry the compatible response format while preserving the
   configured privacy controls.

## Out of scope

- Storing or committing OpenRouter/YouVersion credentials.
- Replacing the approved local fallback when AI is disabled or unavailable.
- Changing the public quiz response schema or exposing the answer key.
- Optimizing concurrent YouVersion requests or adding deployment infrastructure.

## Verification

- Hook test for the exact quiz request derived from player state.
- Cross-layer test: Creation collectible → `createSelahGateway` → Hono app →
  injected OpenRouter client → server-side evaluation.
- OpenRouter client test with simulated HTTP responses for privacy options,
  structured output, and format fallback.
- `npm run lint`, `npm run test:run`, and `npm run build`.

## Traceability

| Requirement | Verification | Status |
| --- | --- | --- |
| ORI-01 | `src/hooks/useSelahFlow.test.ts` | Verified |
| ORI-02 | `server/frontend-integration.test.ts` | Verified |
| ORI-03 | `server/frontend-integration.test.ts` | Verified |
| ORI-04 | `server/services/openrouter.test.ts` | Verified |

## Validation result

- The game hook forwards the exact player language, age group, derived
  difficulty, and AI preference for both general and child profiles.
- A real Creation collectible completed quiz generation and evaluation through
  the public frontend gateway and Hono app with an injected OpenRouter client.
- The public AI quiz contained four alternatives and no answer key or
  pre-answer explanation.
- The OpenRouter client preserved ZDR/privacy controls while retrying from JSON
  Schema to JSON Object and parsed fenced JSON without external network access.
- Final gate: 30 test files and 125 tests passed; lint and production build
  passed; no tests were removed or skipped.

## Operational prerequisite

The live local path additionally requires an ignored `.env` with
`OPENROUTER_API_KEY`. `YVP_APP_KEY` enables live YouVersion text; without it the
same OpenRouter flow remains grounded in the approved public snapshot.
