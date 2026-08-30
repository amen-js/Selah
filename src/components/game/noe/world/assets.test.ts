// The app tsconfig intentionally exposes browser types only; Vitest executes
// this integrity check in Node, so keep these test-only imports local here.
// @ts-expect-error Node typings are provided by the Vitest runtime config.
import { createHash } from 'node:crypto'
// @ts-expect-error Node typings are provided by the Vitest runtime config.
import { existsSync, readFileSync } from 'node:fs'
// @ts-expect-error Node typings are provided by the Vitest runtime config.
import { basename, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { momentosNoe } from '../progression/catalogo'
import {
  idsAssetsCanteiroNoe,
  manifestoAssetsNoe,
  obterAssetNoe,
  selecionarAssetsNoePorAreaEMomento,
} from './assets'

declare const process: { cwd(): string }

function caminhoPublico(urlRuntime: string) {
  return resolve(process.cwd(), 'public', urlRuntime.replace(/^\/+/, ''))
}

function sha256Arquivo(urlRuntime: string) {
  return createHash('sha256')
    .update(readFileSync(caminhoPublico(urlRuntime)))
    .digest('hex')
}

describe('manifesto de assets do canteiro de Noé', () => {
  it('mantém os dez IDs estáveis, únicos e com lookup tipado', () => {
    const ids = manifestoAssetsNoe.entradas.map(({ id }) => id)

    expect(ids).toEqual(idsAssetsCanteiroNoe)
    expect(new Set(ids).size).toBe(10)
    expect(obterAssetNoe('canteiro-bancada')?.urlRuntime).toBe(
      '/models/noah/shared/kenney/survival/workbench.glb',
    )
  })

  it('aponta somente para os GLBs auditados e mantém hashes e bytes reais', () => {
    for (const entrada of manifestoAssetsNoe.entradas) {
      expect(entrada.urlRuntime).toMatch(
        /^\/models\/noah\/shared\/kenney\/survival\/[a-z-]+\.glb$/,
      )
      expect(entrada.urlRuntime).not.toMatch(/(?:Users|home|Downloads)/i)
      expect(existsSync(caminhoPublico(entrada.urlRuntime))).toBe(true)
      expect(entrada.licenca.arquivoOrigem).toBe(
        `Models/GLB format/${basename(entrada.urlRuntime)}`,
      )
      expect(entrada.licenca.sha256).toBe(sha256Arquivo(entrada.urlRuntime))
      expect(entrada.bytes).toBe(
        readFileSync(caminhoPublico(entrada.urlRuntime)).byteLength,
      )
    }
  })

  it('mantém o payload GLB mais textura abaixo de 200 KiB', () => {
    const urls = [
      ...manifestoAssetsNoe.entradas.map(({ urlRuntime }) => urlRuntime),
      manifestoAssetsNoe.texturaCompartilhada.urlRuntime,
    ]
    const bytesReais = [...new Set(urls)].reduce(
      (total, url) => total + readFileSync(caminhoPublico(url)).byteLength,
      0,
    )
    const bytesDeclarados =
      manifestoAssetsNoe.entradas.reduce(
        (total, entrada) => total + entrada.bytes,
        0,
      ) + manifestoAssetsNoe.texturaCompartilhada.bytes

    expect(bytesReais).toBe(139_356)
    expect(bytesDeclarados).toBe(bytesReais)
    expect(bytesReais).toBeLessThanOrEqual(200 * 1_024)
    expect(sha256Arquivo(manifestoAssetsNoe.texturaCompartilhada.urlRuntime)).toBe(
      manifestoAssetsNoe.texturaCompartilhada.licenca.sha256,
    )
  })

  it('registra CC0 e proveniência oficial para modelos e textura', () => {
    const licenciados = [
      ...manifestoAssetsNoe.entradas,
      manifestoAssetsNoe.texturaCompartilhada,
    ]

    for (const item of licenciados) {
      expect(item.licenca.identificador).toBe('CC0-1.0')
      expect(item.licenca.criador).toBe('Kenney')
      expect(item.licenca.urlFonte).toBe(
        'https://kenney.nl/assets/survival-kit',
      )
      expect(item.licenca.sha256).toMatch(/^[a-f0-9]{64}$/)
    }

    const licencaLocal = readFileSync(
      caminhoPublico('/models/noah/shared/kenney/survival/License.txt'),
      'utf8',
    )
    expect(licencaLocal).toContain('Creative Commons Zero, CC0')
  })

  it('libera M1 e M2 cumulativamente apenas dentro do canteiro', () => {
    const idsM1 = selecionarAssetsNoePorAreaEMomento(
      'canteiro-vale',
      'chamado-canteiro',
    ).map(({ id }) => id)
    const idsM2 = selecionarAssetsNoePorAreaEMomento(
      'canteiro-vale',
      'coleta-vedacao',
    ).map(({ id }) => id)
    const idsRetornoAoCanteiro = selecionarAssetsNoePorAreaEMomento(
      'canteiro-vale',
      'fechamento-porta',
    ).map(({ id }) => id)

    expect(idsM1).toEqual(idsAssetsCanteiroNoe.slice(0, 6))
    expect(idsM1).not.toContain('canteiro-tabuas')
    expect(idsM2).toEqual(idsAssetsCanteiroNoe)
    expect(idsRetornoAoCanteiro).toEqual(idsAssetsCanteiroNoe)
  })

  it('não vaza chunks do canteiro para áreas futuras', () => {
    expect(
      selecionarAssetsNoePorAreaEMomento(
        'interior-arca',
        'estoque-mantimentos',
      ),
    ).toEqual([])
    expect(
      selecionarAssetsNoePorAreaEMomento(
        'campo-animais',
        'conducao-animais',
      ),
    ).toEqual([])
    expect(
      selecionarAssetsNoePorAreaEMomento(
        'ararate-nova-terra',
        'nova-terra-arco-iris',
      ),
    ).toEqual([])

    const indiceMomento = new Map(
      momentosNoe.map((momento, indice) => [momento.id, indice]),
    )
    for (const entrada of manifestoAssetsNoe.entradas) {
      expect(entrada.areaId).toBe('canteiro-vale')
      expect(indiceMomento.get(entrada.momentoMinimo)).toBeLessThanOrEqual(1)
    }
  })

  it('usa fallback válido e somente colisores primitivos explícitos', () => {
    for (const entrada of manifestoAssetsNoe.entradas) {
      expect(entrada.fallback.tipo).toBe('primitivo')
      expect(entrada.fallback.dimensoes.every((valor) => valor > 0)).toBe(true)
      expect(entrada.escalaVisual).toBeGreaterThan(0)
      expect(['nenhum', 'cuboid']).toContain(entrada.colisor.tipo)
      expect(JSON.stringify(entrada.colisor)).not.toMatch(
        /trimesh|convexHull|mesh-derived|escalaVisual/i,
      )

      if (entrada.colisor.tipo === 'cuboid') {
        expect(
          entrada.colisor.meiaExtensaoMetros.every((valor) => valor > 0),
        ).toBe(true)
        expect(entrada.colisor.deslocamentoMetros).toHaveLength(3)
      }
    }
  })

  it('permanece declarativo e sem acoplamento a loaders ou R3F', () => {
    const codigoFonte = readFileSync(
      resolve(process.cwd(), 'src/components/game/noe/world/assets.ts'),
      'utf8',
    )

    expect(codigoFonte).not.toMatch(
      /useGLTF|GLTFLoader|\.preload\(|@react-three\/|from ['"]three['"]/,
    )
  })
})
