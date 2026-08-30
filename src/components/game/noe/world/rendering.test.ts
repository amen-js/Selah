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
    expect(fonte).toContain("if (!reparada) return <RampaQuebrada />")
    expect(fonte).toContain('name="rampa-arca-reparada"')
    expect(fonte).toContain('name="selos-betume-persistentes"')
  })

  it('usa família procedural apropriada e bosque CC0 sem colisão automática', () => {
    const familia = ler('FamiliaNoe.tsx')
    const bosque = ler('BosqueGoferNoe.tsx')
    const cenografia = ler('cenografia.ts')

    expect(cenografia).toContain("{ id: 'noe'")
    expect(cenografia).toContain("{ id: 'sem'")
    expect(cenografia).toContain("{ id: 'jafe'")
    expect(familia).toContain('export function FamiliaNoe')
    expect(familia).not.toMatch(/RigidBody|Collider/)
    expect(bosque).toContain(
      '/models/creation/shared/kenney/tree_default.glb',
    )
    expect(bosque).toContain("colisor: 'nenhum'")
    expect(bosque).not.toMatch(/RigidBody|Collider/)
  })

  it('detecta proximidade sem capturar teclado, store ou progressão', () => {
    const fonte = ler('TarefasCanteiroNoe.tsx')

    expect(fonte).toContain('useFrame')
    expect(fonte).not.toMatch(
      /keydown|keyup|addEventListener|useGameStore|processarEventoProgressao/,
    )
  })
})
