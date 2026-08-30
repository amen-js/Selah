// The app tsconfig intentionally exposes browser types only; Vitest executes
// this integrity check in Node, so keep these test-only imports local here.
// @ts-expect-error Node typings are provided by the Vitest runtime config.
import { createHash } from 'node:crypto'
// @ts-expect-error Node typings are provided by the Vitest runtime config.
import { existsSync, readFileSync } from 'node:fs'
// @ts-expect-error Node typings are provided by the Vitest runtime config.
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { momentosCriacao } from '../components/game/creation/progression'
import {
  manifestoAssetsCriacao,
  obterManifestoAssetCriacao,
} from './criacaoAssets'

const idsAssetCriacao = new Set(momentosCriacao.flatMap((momento) => momento.assets))
const idsMomentoCriacao = new Set(momentosCriacao.map((momento) => momento.id))

declare const process: { cwd(): string }

function caminhoAsset(arquivo: string) {
  return resolve(process.cwd(), 'public', arquivo.replace(/^\/+/, ''))
}

describe('manifesto de assets da Criação', () => {
  it('não duplica IDs e todos pertencem ao catálogo tipado', () => {
    const ids = manifestoAssetsCriacao.entradas.map((entrada) => entrada.id)

    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(idsAssetCriacao.has(id)).toBe(true)
  })

  it('aponta apenas para arquivos existentes dentro de public/models/creation', () => {
    for (const entrada of manifestoAssetsCriacao.entradas) {
      expect(entrada.arquivo).toMatch(/^\/models\/creation\//)
      expect(entrada.arquivo).not.toMatch(/(?:^|[/\\])(?:Users|home)[/\\]/i)
      expect(entrada.arquivo).not.toMatch(/^[A-Za-z]:[/\\]/)
      expect(existsSync(caminhoAsset(entrada.arquivo))).toBe(true)
    }
  })

  it('mantém o SHA-256 declarado alinhado ao arquivo distribuído', () => {
    for (const entrada of manifestoAssetsCriacao.entradas) {
      const sha256 = createHash('sha256')
        .update(readFileSync(caminhoAsset(entrada.arquivo)))
        .digest('hex')

      expect(entrada.licenca.sha256).toBe(sha256)
    }
  })

  it('exige proveniência, licença, momentos e escala válidos', () => {
    for (const entrada of manifestoAssetsCriacao.entradas) {
      expect(entrada.licenca.urlFonte).toMatch(/^https:\/\//)
      expect(entrada.licenca.criador.trim()).not.toBe('')
      expect(entrada.licenca.identificador.trim()).not.toBe('')
      expect(entrada.licenca.sha256).toMatch(/^[a-f0-9]{64}$/)
      expect(entrada.momentos.length).toBeGreaterThan(0)
      expect(entrada.escala).toBeGreaterThan(0)
      expect(['+z', '-z']).toContain(entrada.eixoFrontal)

      for (const momento of entrada.momentos) {
        expect(idsMomentoCriacao.has(momento)).toBe(true)
      }
    }
  })

  it('reserva nós de colisão, visual e anchors às convenções do engine', () => {
    for (const entrada of manifestoAssetsCriacao.entradas) {
      for (const no of entrada.nosColisao ?? []) expect(no).toMatch(/^COL_/)
      for (const no of entrada.nosVisuais ?? []) expect(no).toMatch(/^VIS_/)
      for (const ancora of entrada.ancoras ?? []) expect(ancora).toMatch(/^ANCHOR_/)
    }
  })

  it('não trata áudio como modelo GLB', () => {
    for (const entrada of manifestoAssetsCriacao.entradas) {
      if (entrada.tipo === 'audio') expect(entrada.arquivo).not.toMatch(/\.glb$/i)
    }
  })

  it('expõe lookup estável por ID para o loader futuro', () => {
    const rios = obterManifestoAssetCriacao('rios')
    const ovelha = obterManifestoAssetCriacao('ovelha')
    const adao = obterManifestoAssetCriacao('adao')
    const eva = obterManifestoAssetCriacao('eva')

    expect(rios?.arquivo).toBe('/models/creation/shared/kenney/ground_riverStraight.glb')
    expect(ovelha?.arquivo).toContain('/quaternius/farm-animals/sheep.glb')
    expect(adao?.arquivo).toContain('/quaternius/universal-base-characters/adam.glb')
    expect(eva?.arquivo).toContain('/quaternius/universal-base-characters/eve.glb')
    expect(ovelha?.licenca.identificador).toBe('CC0-1.0')
    expect(adao?.licenca.identificador).toBe('CC0-1.0')
    expect(eva?.licenca.identificador).toBe('CC0-1.0')
    expect(obterManifestoAssetCriacao('leao')).toBeUndefined()
  })
})
