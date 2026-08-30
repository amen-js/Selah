# Creation asset chunks

This directory contains independently loadable CC0 chunks for the Creation
region. Environment pieces live in `shared/kenney`; the sheep lives in
`shared/quaternius`; and the two project-authored Eden characters are built by
the runtime and described in `characters`. The manifest at
`src/mapas/criacaoAssets.ts` is the source of truth for every runtime URL.

## Provenance and license

- Source pack: [Kenney Nature Kit](https://kenney.nl/assets/nature-kit)
- Official archive:
  `https://kenney.nl/media/pages/assets/nature-kit/37ac38a37b-1677698939/kenney_nature-kit.zip`
- Archive SHA-256:
  `fa7974a0d342bfe63c38664ba9f8ec1a4aab8ea25f099bdc56870e33588c4d9d`
- Creator: Kenney
- License: [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)
- The original `License.txt` from the archive is retained beside the GLBs.

- Animal source: [Quaternius Farm Animal Pack](https://quaternius.com/packs/farmanimal.html)
- Creator: Quaternius
- License: [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)
- Each original `License.txt` is retained beside the converted GLBs.

- Human source: project-authored `PersonagemEden.tsx`
- Creator: Equipe Selah
- Design: storybook low-poly Adão e Eva, with modest Eden clothing and no RPG
  accessories
- The character descriptors and checksums live in `characters`.

The supplied `Map by Poly by Google - bU3B6P0ngfi.glb` is intentionally not
copied here. It is a textured world-map plaque rather than a Creation terrain
chunk; its separate provenance and technical rejection are recorded in the
asset integration report.

## Technical notes

The Kenney GLBs are original exports from the official archive. The sheep was
converted from the official FBX with FBX2glTF 0.9.7 and retains the `Idle` and
`Jump` clips. Adão and Eva use lightweight hierarchical meshes authored for
this project; their shoulders, elbows, heads and bodies animate independently
in runtime for asymmetric relaxed poses.

No visual GLB is used as terrain collision. The Creation terrain owns one
dedicated low-poly Rapier trimesh, while landmark collisions use explicit
primitive proxies.

Per-file hashes and measured metrics are documented in
`.specs/features/dev1-creation-world/asset-integration-report.md` and are
validated by `src/mapas/criacaoAssets.test.ts`.
