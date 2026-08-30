// @ts-expect-error Node typings are provided by the Vitest runtime config.
import { readFileSync } from 'node:fs'
// @ts-expect-error Node typings are provided by the Vitest runtime config.
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

declare const process: { cwd(): string }

const fonte = readFileSync(
  resolve(
    process.cwd(),
    'src/components/game/noe/world/AtmosferaNoe.tsx',
  ),
  'utf8',
)

describe('contratos de renderização da atmosfera de Noé', () => {
  it('agrupa a chuva em uma única malha instanciada', () => {
    expect(fonte).toContain('<instancedMesh')
    expect(fonte).toContain('setMatrixAt')
    expect(fonte).not.toContain('gotas.map(')
  })
})
