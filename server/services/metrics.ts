const JANELA_MS = 60_000
const LIMITE_POR_JANELA = 30
const RETENCAO_LOG_MS = 7 * 24 * 60 * 60 * 1000

export type TipoEvento = 'selah_iniciado' | 'selah_concluido' | 'quiz_respondido'

export interface EventoMetrica {
  tipo: TipoEvento
  historiaId: string
  versaoApp: string
  acertou?: boolean
}

export interface ContadorAgregado {
  dia: string
  historiaId: string
  versaoApp: string
  selahsIniciados: number
  selahsConcluidos: number
  quizzesRespondidos: number
  quizzesAcertos: number
}

interface LogOperacional {
  ip: string
  em: number
  motivo: 'recebido' | 'rate-limit'
}

const diaUtc = (timestamp: number): string => new Date(timestamp).toISOString().slice(0, 10)

const chave = (evento: EventoMetrica, timestamp: number): string =>
  `${diaUtc(timestamp)}|${evento.historiaId}|${evento.versaoApp}`

export const createMetricsStore = (now: () => number = Date.now) => {
  const agregados = new Map<string, ContadorAgregado>()
  const hits = new Map<string, number[]>()
  const logs: LogOperacional[] = []

  const expirarLogs = (timestamp: number): void => {
    const limite = timestamp - RETENCAO_LOG_MS
    while (logs.length > 0 && logs[0].em < limite) logs.shift()
  }

  const permitir = (ip: string, timestamp: number): boolean => {
    const janela = timestamp - JANELA_MS
    const anteriores = (hits.get(ip) ?? []).filter((item) => item >= janela)
    if (anteriores.length >= LIMITE_POR_JANELA) {
      hits.set(ip, anteriores)
      return false
    }
    anteriores.push(timestamp)
    hits.set(ip, anteriores)
    return true
  }

  return {
    registrar: (
      ip: string,
      eventos: EventoMetrica[],
    ): { aceito: boolean; motivo?: 'rate-limit' } => {
      const timestamp = now()
      expirarLogs(timestamp)

      if (!permitir(ip, timestamp)) {
        logs.push({ ip, em: timestamp, motivo: 'rate-limit' })
        return { aceito: false, motivo: 'rate-limit' }
      }

      logs.push({ ip, em: timestamp, motivo: 'recebido' })

      for (const evento of eventos) {
        const id = chave(evento, timestamp)
        const atual = agregados.get(id) ?? {
          dia: diaUtc(timestamp),
          historiaId: evento.historiaId,
          versaoApp: evento.versaoApp,
          selahsIniciados: 0,
          selahsConcluidos: 0,
          quizzesRespondidos: 0,
          quizzesAcertos: 0,
        }

        switch (evento.tipo) {
          case 'selah_iniciado':
            atual.selahsIniciados += 1
            break
          case 'selah_concluido':
            atual.selahsConcluidos += 1
            break
          case 'quiz_respondido':
            atual.quizzesRespondidos += 1
            if (evento.acertou) atual.quizzesAcertos += 1
            break
          default: {
            const exhaustive: never = evento.tipo
            throw new Error(`Evento não suportado: ${exhaustive}`)
          }
        }

        agregados.set(id, atual)
      }

      return { aceito: true }
    },
    agregados: (): ContadorAgregado[] => [...agregados.values()],
    logsOperacionais: (): LogOperacional[] => logs.map((item) => ({ ...item })),
  }
}

export type MetricsStore = ReturnType<typeof createMetricsStore>
