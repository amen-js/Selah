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

describe('contratos de renderização dos animais de Noé', () => {
  it('usa animais procedurais leves e famílias com múltiplos integrantes', () => {
    const fonte = ler('AnimaisFamiliaNoe.tsx')

    expect(fonte).toContain('export function GrupoAnimaisNoe')
    expect(fonte).toContain('especies.length >= 2')
    expect(fonte).toContain('export function FamiliaNoeEmGrupo')
    expect(fonte).not.toMatch(/useGLTF|\.glb|RigidBody|Collider/)
  })

  it('delega confirmação ao árbitro e nunca captura teclado ou store', () => {
    for (const arquivo of ['CampoAnimaisNoe.tsx', 'HabitatsArcaNoe.tsx']) {
      const fonte = ler(arquivo)
      expect(fonte).toContain('acionar: () =>')
      expect(fonte).toContain('useFrame')
      expect(fonte).not.toMatch(
        /keydown|keyup|addEventListener|useGameStore|processarEventoProgressao/,
      )
    }
  })

  it('mantém grupos em condução e famílias descansando após o encaixe', () => {
    expect(ler('CampoAnimaisNoe.tsx')).toContain('grupoInteiro: true')
    const habitats = ler('HabitatsArcaNoe.tsx')
    expect(habitats).toContain('familiaDescansando: concluido')
    expect(habitats).toContain('familia-descansando-')
  })
})
