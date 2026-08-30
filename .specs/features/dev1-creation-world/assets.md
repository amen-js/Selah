# Creation World Asset Manifest

Assets should be delivered as optimized `.glb` files with embedded or colocated
textures, real-world scale, origin documented, and license/provenance beside the
file. Large environment pieces must remain separable so each moment can load on
demand.

## P0 — required for the vertical slice

| Group | Assets | Technical requirement | Used by |
| --- | --- | --- | --- |
| Traversable world | One terrain kit or separated Campo, Vale das Águas, Bosque and Éden chunks | Walkable collision surface; no decorative underside in collider mesh | 1-9 |
| Paths and relief | Cliffs, hills, rocks, trail pieces and one elevated lookout | Separate low-poly collision proxies | 1-4, 7 |
| Water | River, spring, lake and shoreline pieces | Visual water separate from collision; repeatable material | 3, 7 |
| Vegetation | 5-8 trees, 3 bushes, 3 flowers, grass clusters and sprouts | Static props plus one growth/reveal variant or animation | 4, 7 |
| Creation light | Small guide light, expanding light core and path markers | Transparent/emissive meshes or VFX-ready anchors | 1-2 |
| Celestial set | Sun, moon, stars and cloud layers | Independent nodes for time-of-day animation | 5 |
| Animals | Lion, giraffe and sheep | Rigged GLB with idle and walk clips; consistent scale and orientation | 6 |
| Eden landmark | Distinct central garden tree and four-river focal area | Landmark separated from general vegetation | 7 |
| Human characters | Adam and Eve | Rigged GLB; idle clip is sufficient for the slice | 8 |
| Choice landmark | Knowledge tree and visible fruit | Separate fruit node, but no player pickup/control animation | 9 |

## P1 — sound and narrative feedback

| Group | Assets | Notes |
| --- | --- | --- |
| Voice Guide | Initial, support and transition lines for all nine moments | Prefer recorded PT-BR first; EN/ES follow approved localized scripts |
| Ambience | void silence bed, wind, river, forest, birds, animals, Eden ambience | Loop points and loudness normalized |
| Reveals | light, water, vegetation, celestial, animal and Eden stingers | Short layers that can fade independently through Howler |
| Animal audio | lion, giraffe ambience/foley and sheep | Child-friendly, no startling peaks |

## P2 — polish

- birds and fish with simple loop animations;
- seed/sprout growth variants;
- day/night sky gradient or cubemap variants;
- leaf, firefly, pollen and water-mist particles;
- LOD variants for terrain, vegetation, animals and human characters;
- baked lightmaps or compressed KTX2 textures if the final scene needs them.

## Delivery checklist

- forward axis and unit scale documented;
- pivots placed for gameplay, not presentation turntables;
- animation clip names stable (`Idle`, `Walk`, optional `Run`);
- visual meshes and collision proxies clearly named;
- textures no larger than necessary for the browser target;
- source URL, creator, license and checksum recorded;
- no asset is bundled into another region's file.
