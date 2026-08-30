# Creation Procedural VFX Specification

## Goal

Provide a standalone, fully-tested React Three Fiber package of procedural visual effects for the nine Creation beats in Selah without touching game models, terrain, backend, or global store.

## Requirements

1. **VFX-01:** Expose `EfeitosCriacao` accepting `{ momentoId, enabled, reducedMotion? }` and returning procedural R3F components mapped to visible assets from `obterRevelacaoCriacao`.
2. **VFX-02:** Expose pure helper `obterConfiguracaoEfeitosCriacao(momentoId, options?)` returning the active procedural effect IDs and configurations.
3. **VFX-03:** Support exactly the 9 approved procedural asset IDs:
   - `ambiente-vazio`
   - `luz-guia`
   - `nucleo-luz`
   - `marcadores-caminho-luz`
   - `efeito-crescimento`
   - `sol`
   - `lua`
   - `estrelas`
   - `nuvens`
4. **VFX-04:** Explicitly exclude audio, models, characters, animals, and terrain assets from procedural rendering.
5. **VFX-05:** Support cumulative reveal of procedural effects matching the narrative progression of Creation.
6. **VFX-06:** Deterministic star and particle generation without random values in render loops or unmount leaks.
7. **VFX-07:** Support `reducedMotion` prop to freeze or reduce motion, adhering to child-friendly and accessibility guidelines.
8. **VFX-08:** `enabled: false` must cleanly disable or freeze effect rendering.
9. **VFX-09:** Zero allocation in `useFrame` (no `new Vector3`, `new Color`, geometries, or materials per frame).
