# Procedural Visual Direction — Creation Journey VFX

## Overview

Procedural visual effects for the nine Creation beats in Selah.
The package is designed for children (5-11 primary, 12-18 secondary) with a focus on warmth, calm, wonder, and sensory safety (no strobe, no harsh flashes, no aggressive particles, no mandatory post-processing bloom).

## Visual Language Principles

1. **Child-Friendly & Welcoming:** Soft shapes, warm color temperatures (2700K to 4500K), smooth luminous halos.
2. **Sensory Safety:** Zero strobe, zero rapid flashing (>1.5 Hz prohibited), gentle fades and easing curves (`easeInOutSine`, `easeOutCubic`, `damp`).
3. **Contemplative Rhythm:** Subtle levitation and slow drift matching the meditative "Selah" tone.
4. **Accessible Reduced Motion:** Pure prop-driven `reducedMotion` behavior freezing or reducing oscillations and particle motion to static or minimal linear drifts.

## Color Palette per Phase

| Moment ID | Scenario Phase | Primary / Sky Color | Accent / Glow | Emotional Tone |
| :--- | :--- | :--- | :--- | :--- |
| `vazio` | `escuro` | `#07131F` / `#30445E` | `#4A6583` / `#7A9CB8` | Quiet wonder, expectant stillness |
| `luz` | `amanhecer` | `#5D8793` / `#FFE1A6` | `#FFD56B` / `#FFF6D6` | Revelation, warm golden light |
| `ceu-terra-aguas` | `mundo-formado` | `#8FBFC8` / `#FFF0C4` | `#65A9C7` / `#FFF2C7` | Clarity, crystalline waters and land |
| `natureza` | `mundo-verde` | `#A9D4C2` / `#FFF2C9` | `#82D866` / `#FFE869` | Sprouting life, blooming joy |
| `ceu-ritmo` | `ciclo-celeste` | `#2E4069` / `#8795CA` | `#FFEAA7` / `#C7CFF4` | Day & night celestial rhythm |
| `criaturas` | `mundo-vivo` | `#ACD9C8` / `#FFF0C4` | `#E8B872` / `#FFF2C0` | Living world, warm earthy accents |
| `eden` | `jardim` | `#BDDFC2` / `#FFF5CF` | `#F8B4D9` / `#55A064` | Harmony, abundant garden peace |
| `adao-e-eva` | `humanidade` | `#C7DFC1` / `#FFF0C9` | `#FFDCA0` / `#D8A36E` | Love, friendship, human warmth |
| `fruto-escolha` | `escolha` | `#9EB3A3` / `#EAD3B1` | `#E8BD88` / `#A35C52` | Reverent reflection and enduring grace |

## Procedural Asset IDs & Budgets

| Asset ID | Category | Primitive / Strategy | Max Count / Budget | Colors | Reduced Motion Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ambiente-vazio` | Ambient VFX | Deterministic `Points` with `BufferGeometry` | 48 particles | `#4A6583`, `#7A9CB8` | Zero vertical/horizontal drift; static gentle opacity (0.22) |
| `luz-guia` | Guide VFX | Core sphere + outer halo billboard + pointLight | 1 instance (2 meshes, 1 light) | `#FFF6D6`, `#FFD56B`, `#FFE699` | Static elevation, fixed halo scale, constant gentle light |
| `nucleo-luz` | Light Core | Central emissive sphere + concentric accent rings | 1 core, 2 rings | `#FFFFFF`, `#FFF4CF`, `#FFD875` | Fade-in without fast radial pulse or axial spin |
| `marcadores-caminho-luz` | Ground Markers | Instanced horizontal planar discs | 8 instances | `#FFE88F`, `#F7B24D` | Constant uniform opacity (0.65), no travelling wave |
| `efeito-crescimento` | Flora VFX | Instanced rising leaf/pollen particles | 28 instances | `#82D866`, `#FFE869`, `#F8B4D9` | Straight upward rise without spiral rotation |
| `sol` | Celestial VFX | Dual-layer celestial billboard disc | 1 instance (2 meshes) | `#FFF7D6`, `#FFD866`, `#FFBA52` | Fixed scale, static celestial position |
| `lua` | Celestial VFX | Dual-layer lunar billboard disc | 1 instance (2 meshes) | `#EEF4FF`, `#B5CFFF`, `#7899D4` | Static celestial position |
| `estrelas` | Celestial VFX | Deterministic upper hemispherical `Points` | 140 points | `#FFEAA7`, `#E8F0FE`, `#DFD6F7` | Static point brightness, no twinkle oscillation |
| `nuvens` | Celestial VFX | Low-poly cloud clusters (`Dodecahedron` / `Icosahedron`) | 6 clusters (18 sub-meshes) | `#FFFFFF`, `#D6E5F0`, `#FDE2CF` | Frozen position or ultra-slow drift (0.015 m/s) |

## Non-goals & Restrictions

- Audio is handled separately; no audio nodes or sound logic.
- No geometric approximations for fruit, animals, humans, terrain, rivers, vegetation, or buildings.
- No global lighting, background, or fog overrides (controlled by `AtmosferaCriacao`).
- Zero DOM access inside Canvas.
