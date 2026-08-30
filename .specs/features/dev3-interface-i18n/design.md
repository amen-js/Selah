# Interface Internationalization Design

**Spec:** `.specs/features/dev3-interface-i18n/spec.md`
**Status:** Approved

## Architecture

`useGameStore.idioma` remains the single locale state. A small internal i18n module exposes a pure translator and a Zustand-backed hook; components request typed keys and never manage a second locale.

```text
LanguageSelector -> setIdioma -> Zustand persist
                            -> useTranslation -> React copy
                            -> document locale metadata
                            -> useSelahFlow -> gateway request idioma
```

## Public Interfaces

```ts
type TranslationKey = keyof typeof ptBR
type TranslationParams = Record<string, string | number>

translate(idioma: Idioma, key: TranslationKey, params?: TranslationParams): string
useTranslation(): { idioma: Idioma; t: typeof translateForCurrentLanguage }
```

Catalogs are flat records. `en-US` and `es-ES` are typed against the `pt-BR` key set. Runtime interpolation replaces `{token}` with escaped React text values; tests verify that every locale uses the same tokens.

## Integration Decisions

- No i18n dependency or provider is added.
- Root synchronizes `lang`, title, description, and its lazy-loading status copy.
- Component-visible strings move to catalogs; dynamic API/NPC payloads remain unchanged.
- `useSelahFlow` translates only messages it places in `selahAtivo.erro`.
- Plural behavior uses explicit `.one` and `.other` keys selected by exact count.
- CSS changes are allowed only when UAT proves localized copy does not fit.

