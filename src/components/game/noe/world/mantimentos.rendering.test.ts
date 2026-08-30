// @ts-expect-error Node typings are provided by the Vitest runtime config.
import { readFileSync } from 'node:fs'
// @ts-expect-error Node typings are provided by the Vitest runtime config.
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

declare const process: { cwd(): string }

const fonte = readFileSync(
  resolve(
    process.cwd(),
    'src/components/game/noe/world/MantimentosArcaNoe.tsx',
  ),
  'utf8',
)

describe('contratos de renderização do estoque de Noé', () => {
  it('publica callback local e deixa teclado e progressão sob o árbitro pai', () => {
    expect(fonte).toContain('acionar: () =>')
    expect(fonte).toContain('onConcluirUnidadeRef.current(')
    expect(fonte).not.toMatch(
      /keydown|keyup|addEventListener|useGameStore|processarEventoProgressao/,
    )
  })

  it('usa somente corpos fixos e colisores cuboid explícitos nos conveses', () => {
    expect(fonte).toContain('type="fixed"')
    expect(fonte).toContain('colliders={false}')
    expect(fonte).toContain('<CuboidCollider')
    expect(fonte).not.toMatch(/trimesh|convexHull|colliders=["'{](?:hull|cuboid)/i)
  })

  it('torna os três conveses, baías, poleiros e lampiões legíveis', () => {
    expect(fonte).toContain('interior-tres-niveis-arca-noe')
    expect(fonte).toContain('baias-conves-inferior')
    expect(fonte).toContain('baias-conves-medio')
    expect(fonte).toContain('poleiros-conves-superior')
    expect(fonte).toContain('lampioes-interior-arca')
  })

  it('mantém itens concluídos no destino e um único item visual carregado', () => {
    expect(fonte).toContain('mantimento-organizado-')
    expect(fonte).toContain('<MantimentoCarregado')
    expect(fonte).toContain('mantimentoCarregadoId')
  })
})
