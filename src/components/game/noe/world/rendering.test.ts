// @ts-expect-error Node typings are provided by the Vitest runtime config.
import { readFileSync } from 'node:fs'
// @ts-expect-error Node typings are provided by the Vitest runtime config.
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

declare const process: { cwd(): string }

function ler(arquivo: string) {
  return readFileSync(
    resolve(process.cwd(), 'src/components/game/noe/world', arquivo),
    'utf8',
  )
}

describe('contratos de renderização do canteiro de Noé', () => {
  it('carrega GLBs apenas dentro do componente montado e mantém fallback', () => {
    const fonte = ler('AssetCanteiroNoe.tsx')

    expect(fonte).toContain('useGLTF(entrada.urlRuntime)')
    expect(fonte).toContain('<Suspense fallback={<FallbackAssetNoe')
    expect(fonte).toContain('obterDeslocamentoModeloAssetNoe(entrada)')
    expect(fonte).toContain('obterDeslocamentoFallbackAssetNoe(entrada)')
    expect(fonte).toContain('<icosahedronGeometry')
    expect(fonte).not.toMatch(/useGLTF\.preload|\.preload\(/)
  })

  it('não usa hull, trimesh ou colisores automáticos na arca e rampa', () => {
    const fonte = ler('ArcaCanteiroNoe.tsx')

    expect(fonte).toContain('colliders={false}')
    expect(fonte).toContain('<CuboidCollider')
    expect(fonte).not.toMatch(
      /trimesh|convexHull|colliders=["'{](?:hull|cuboid)/i,
    )
  })

  it('detecta proximidade sem capturar teclado, store ou progressão', () => {
    const fonte = ler('TarefasCanteiroNoe.tsx')

    expect(fonte).toContain('useFrame')
    expect(fonte).not.toMatch(
      /keydown|keyup|addEventListener|useGameStore|processarEventoProgressao/,
    )
  })
})
