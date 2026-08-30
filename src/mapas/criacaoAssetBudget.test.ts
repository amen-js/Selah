// This focused integrity test intentionally uses Node's filesystem APIs. The
// application tsconfig exposes browser types; Vitest supplies the Node runtime.
// @ts-expect-error Node typings are provided by the Vitest runtime config.
import { existsSync, readFileSync, statSync } from 'node:fs'
// @ts-expect-error Node typings are provided by the Vitest runtime config.
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { momentosCriacao } from '../components/game/creation/progression'
import {
  manifestoAssetsCriacao,
} from './criacaoAssets'
import {
  auditarManifestoAssetsCriacao,
  classificarFormatoAssetCriacao,
  LIMITES_ORCAMENTO_ASSETS_CRIACAO,
} from './criacaoAssetBudget'

declare const process: { cwd(): string }

function caminhoAsset(arquivo: string) {
  return resolve(process.cwd(), 'public', arquivo.replace(/^\/+/, ''))
}

function tamanhosManifesto() {
  return Object.fromEntries(
    manifestoAssetsCriacao.entradas.map(({ arquivo }) => {
      const caminho = caminhoAsset(arquivo)
      expect(existsSync(caminho)).toBe(true)
      return [arquivo, statSync(caminho).size]
    }),
  )
}

describe('orçamento e integridade dos chunks da Criação', () => {
  it('mede somente arquivos distribuídos e mantém cada arquivo dentro do limite web', () => {
    const tamanhos = tamanhosManifesto()
    const auditoria = auditarManifestoAssetsCriacao(
      manifestoAssetsCriacao,
      tamanhos,
    )

    expect(auditoria.arquivosBiblioteca).toBe(13)
    expect(auditoria.bytesBibliotecaWeb).toBeLessThanOrEqual(
      LIMITES_ORCAMENTO_ASSETS_CRIACAO.bibliotecaWebMaxBytes,
    )
    for (const registro of auditoria.registros) {
      expect(registro.bytesWeb).toBeGreaterThan(0)
      expect(registro.bytesWeb).toBeLessThanOrEqual(
        LIMITES_ORCAMENTO_ASSETS_CRIACAO.arquivoWebMaxBytes,
      )
    }
  })

  it('classifica Adão e Eva como descritores procedurais, não como GLBs', () => {
    const tamanhos = tamanhosManifesto()
    const auditoria = auditarManifestoAssetsCriacao(
      manifestoAssetsCriacao,
      tamanhos,
    )
    const personagens = auditoria.registros.filter(({ id }) =>
      ['adao', 'eva'].includes(id),
    )

    expect(personagens).toHaveLength(2)
    expect(personagens.every(({ formato }) => formato === 'model-json-procedural')).toBe(true)
    expect(personagens.every(({ bytesPayload }) => bytesPayload === 0)).toBe(true)
    expect(auditoria.porMomento['adao-e-eva'].bytesPayload).toBe(0)
    expect(auditoria.porTipo.personagem.porFormato['model-json-procedural']).toBe(
      auditoria.porMomento['adao-e-eva'].bytesWeb,
    )
    expect(classificarFormatoAssetCriacao('/models/creation/foo.glb')).toBe('glb')
  })

  it('permite apenas reuso compartilhado e elimina duplicação física no orçamento', () => {
    const auditoria = auditarManifestoAssetsCriacao(
      manifestoAssetsCriacao,
      tamanhosManifesto(),
    )

    expect(auditoria.idsDuplicados).toEqual([])
    expect(auditoria.duplicacoes).toEqual([
      expect.objectContaining({
        arquivo: '/models/creation/shared/kenney/ground_riverStraight.glb',
        ids: ['rios', 'rios-eden'],
        compartilhado: true,
      }),
    ])
    expect(auditoria.duplicacoesAcidentais).toEqual([])
    expect(auditoria.porMomento.eden.arquivosUnicos).toBe(3)
  })

  it('mantém cada momento abaixo do orçamento e longe da biblioteca inteira', () => {
    const auditoria = auditarManifestoAssetsCriacao(
      manifestoAssetsCriacao,
      tamanhosManifesto(),
    )

    expect(Object.keys(auditoria.porMomento)).toEqual(
      momentosCriacao.map(({ id }) => id),
    )
    for (const momento of momentosCriacao) {
      const resumo = auditoria.porMomento[momento.id]
      expect(resumo.bytesWeb).toBeLessThanOrEqual(
        LIMITES_ORCAMENTO_ASSETS_CRIACAO.momentoWebMaxBytes,
      )
      expect(resumo.bytesWeb).toBeLessThan(auditoria.bytesBibliotecaWeb)
    }
  })

  it('preserva descritores procedurais válidos fora do payload de modelo', () => {
    const tamanhos = tamanhosManifesto()
    const auditoria = auditarManifestoAssetsCriacao(
      manifestoAssetsCriacao,
      tamanhos,
    )
    const jsonDescriptor = manifestoAssetsCriacao.entradas.find(({ id }) => id === 'adao')
    expect(jsonDescriptor).toBeDefined()
    const descriptor = JSON.parse(
      readFileSync(caminhoAsset(jsonDescriptor!.arquivo), 'utf8'),
    ) as { implementation?: string; animation?: string }
    expect(descriptor.implementation).toContain('PersonagemEden')
    expect(descriptor.animation).toBe('procedural-relaxed-idle')
    expect(auditoria.registros.find(({ id }) => id === 'adao')?.bytesPayload).toBe(0)
  })
})
