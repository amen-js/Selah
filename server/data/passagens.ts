export type HistoriaId = 'criacao' | 'noe' | 'jose'
export type FaixaEtaria = 'crianca' | 'geral'
export type Idioma = 'pt-BR' | 'en-US' | 'es-ES'

export interface PassagemAprovada {
  passagemId: string
  historiaId: HistoriaId
  usfm: string
  faixas: readonly FaixaEtaria[]
  aprovada: true
}

export const PASSAGENS_APROVADAS: readonly PassagemAprovada[] = [
  { passagemId: 'genesis-1-1', historiaId: 'criacao', usfm: 'GEN.1.1', faixas: ['crianca', 'geral'], aprovada: true },
  { passagemId: 'genesis-1-3', historiaId: 'criacao', usfm: 'GEN.1.3', faixas: ['crianca', 'geral'], aprovada: true },
  { passagemId: 'genesis-1-11', historiaId: 'criacao', usfm: 'GEN.1.11', faixas: ['crianca', 'geral'], aprovada: true },
  { passagemId: 'genesis-1-24', historiaId: 'criacao', usfm: 'GEN.1.24', faixas: ['crianca', 'geral'], aprovada: true },
  { passagemId: 'genesis-1-27', historiaId: 'criacao', usfm: 'GEN.1.27', faixas: ['crianca', 'geral'], aprovada: true },
  { passagemId: 'genesis-6-14', historiaId: 'noe', usfm: 'GEN.6.14', faixas: ['crianca', 'geral'], aprovada: true },
  { passagemId: 'genesis-6-19', historiaId: 'noe', usfm: 'GEN.6.19', faixas: ['crianca', 'geral'], aprovada: true },
  { passagemId: 'genesis-7-1', historiaId: 'noe', usfm: 'GEN.7.1', faixas: ['crianca', 'geral'], aprovada: true },
  { passagemId: 'genesis-8-1', historiaId: 'noe', usfm: 'GEN.8.1', faixas: ['crianca', 'geral'], aprovada: true },
  { passagemId: 'genesis-9-13', historiaId: 'noe', usfm: 'GEN.9.13', faixas: ['crianca', 'geral'], aprovada: true },
  { passagemId: 'genesis-37-5', historiaId: 'jose', usfm: 'GEN.37.5', faixas: ['crianca', 'geral'], aprovada: true },
  { passagemId: 'genesis-39-2', historiaId: 'jose', usfm: 'GEN.39.2', faixas: ['crianca', 'geral'], aprovada: true },
  { passagemId: 'genesis-41-16', historiaId: 'jose', usfm: 'GEN.41.16', faixas: ['crianca', 'geral'], aprovada: true },
  { passagemId: 'genesis-45-5', historiaId: 'jose', usfm: 'GEN.45.5', faixas: ['crianca', 'geral'], aprovada: true },
  { passagemId: 'genesis-50-20', historiaId: 'jose', usfm: 'GEN.50.20', faixas: ['crianca', 'geral'], aprovada: true },
]

const porId = new Map(PASSAGENS_APROVADAS.map((passagem) => [passagem.passagemId, passagem]))

export const buscarPassagemAprovada = (passagemId: string): PassagemAprovada | undefined =>
  porId.get(passagemId)

export const passagemPermitida = (
  passagemId: string,
  historiaId: string,
  faixaEtaria: FaixaEtaria,
): PassagemAprovada | undefined => {
  const passagem = porId.get(passagemId)
  if (!passagem || !passagem.aprovada) return undefined
  if (passagem.historiaId !== historiaId) return undefined
  if (!passagem.faixas.includes(faixaEtaria)) return undefined
  return passagem
}
