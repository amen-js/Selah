# Creation asset chunks

This directory contains independently loadable CC0 chunks for the Creation
region. Environment pieces live in `shared/kenney`; the sheep and the two
rigged human characters live in `shared/quaternius`. The manifest at
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
- Human source: [Quaternius Universal Base Characters](https://quaternius.com/packs/universalbasecharacters.html)
- Creator: Quaternius
- License: [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)
- Each original `License.txt` is retained beside the converted GLBs.

The supplied `Map by Poly by Google - bU3B6P0ngfi.glb` is intentionally not
copied here. It is a textured world-map plaque rather than a Creation terrain
chunk; its separate provenance and technical rejection are recorded in the
asset integration report.

## Technical notes

The Kenney GLBs are original exports from the official archive. The sheep was
converted from the official FBX with FBX2glTF 0.9.7 and retains the `Idle` and
`Jump` clips. The official Quaternius human glTFs were packed as GLB, resized
to 1024px textures, and encoded as WebP with glTF-Transform 4.4.2; their
humanoid skins are retained. Humans receive a relaxed procedural idle pose in
the runtime because the free base pack does not contain an animation clip.

No visual GLB is used as terrain collision. The Creation terrain owns one
dedicated low-poly Rapier trimesh, while landmark collisions use explicit
primitive proxies.

Per-file hashes and measured metrics are documented in
`.specs/features/dev1-creation-world/asset-integration-report.md` and are
validated by `src/mapas/criacaoAssets.test.ts`.
