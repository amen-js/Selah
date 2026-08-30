# Dev 1 Hub, Portals, and Noah Region Specification

**Date:** 2026-08-30
**Status:** Verified

## Goal

Turn the existing Creation-only scene into a small multi-region journey without
changing the Selah API, interface contracts, or backend behavior.

## Functional requirements

1. The game starts in the Central Valley hub.
2. The hub exposes portals for Creation, Noah, and Joseph.
3. Creation and Noah are playable destinations; Joseph remains visible and
   unavailable with an "Em breve" message.
4. A portal is selected by player proximity on the XZ plane and activated only
   after a non-repeated `E` or `Enter` key press.
5. A portal transition blocks movement, fades the scene, swaps the active
   region, restores movement, and keeps pointer lock active.
6. Cooldown and exit-to-rearm rules prevent repeated or immediate return
   transitions.
7. Destination spawns stay clear of portals, props, and Selah collectibles.
8. Selah overlays and the parental pause block portal interaction.
9. Creation retains its current movement, camera, collectibles, and Selah flow.
10. Noah uses the existing local map and Selah contracts, with exactly five
    curated passage IDs already accepted by the proxy allowlist.

## Noah slice

The first Noah region is a single geometric fallback environment that visually
communicates the ark, wood, animals, water, and covenant. It does not wait for
external models or live API credentials.

Passages:

- `genesis-6-14`
- `genesis-6-19`
- `genesis-7-1`
- `genesis-8-1`
- `genesis-9-13`

## Out of scope

- Backend routes, prompts, allowlists, cache contents, or credentials.
- Dev 3 store, persistence, parental controls, or Selah overlay contracts.
- NPC conversations, inventory, animal collection, rain simulation, ark
  interior, or a final challenge.
- Joseph gameplay, new external assets, deployment, or mobile controls.

## Verification

- Unit tests for region catalog, map invariants, portal proximity, activation,
  cooldown, and safe spawns.
- Integration coverage for Hub -> Creation -> Hub and Hub -> Noah -> Hub.
- Existing Creation and Selah tests remain green.
- `npm run test:run`, `npm run lint`, and `npm run build` pass.
- Manual browser test validates movement, camera, prompt, fade, pointer lock,
  pause, and anti-loop behavior.

## Validation result

- Manual UAT approved the Hub, portal transitions, and playable regions.
- The feature branch was updated through `origin/main` commit `c74e123`,
  preserving the responsible onboarding and OpenRouter quiz integration.
- 40 test files and 174 tests passed; lint and production build passed.
- No backend, Selah store, external asset, credential, or deployment behavior
  was changed by this feature.
