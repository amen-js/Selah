import { useMemo } from 'react'
import { ArcaCanteiroNoe } from './ArcaCanteiroNoe'
import { AssetCanteiroNoe } from './AssetCanteiroNoe'
import { BosqueGoferNoe } from './BosqueGoferNoe'
import {
  obterEstadoVisualCanteiroNoe,
  selecionarInstanciasAssetsCanteiroNoe,
} from './canteiro'
import { FamiliaNoe } from './FamiliaNoe'
import { TarefasCanteiroNoe } from './TarefasCanteiroNoe'
import type { CanteiroNoeProps, ChunkCanteiroNoeId } from './types'

const chunksCanteiro: readonly ChunkCanteiroNoeId[] = [
  'canteiro-m1',
  'canteiro-m2',
]

/** M1/M2 world slice. Future areas are intentionally absent from this mount. */
export function CanteiroNoe(props: CanteiroNoeProps) {
  const instancias = useMemo(
    () =>
      selecionarInstanciasAssetsCanteiroNoe(
        props.momentoAtualId,
        props.progressoMomentoAtual,
      ),
    [props.momentoAtualId, props.progressoMomentoAtual],
  )
  const estadoVisual = useMemo(
    () =>
      obterEstadoVisualCanteiroNoe(
        props.momentoAtualId,
        props.progressoMomentoAtual,
      ),
    [props.momentoAtualId, props.progressoMomentoAtual],
  )

  return (
    <group name="canteiro-noe-m1-m2">
      <ArcaCanteiroNoe
        momentoAtualId={props.momentoAtualId}
        progressoMomentoAtual={props.progressoMomentoAtual}
      />
      <BosqueGoferNoe />
      {estadoVisual.familiaNoCanteiro && <FamiliaNoe />}
      <group name="chunks-assets-canteiro-noe">
        {chunksCanteiro.map((chunkId) => {
          const instanciasChunk = instancias.filter(
            (instancia) => instancia.chunkId === chunkId,
          )
          if (instanciasChunk.length === 0) return null

          return (
            <group key={chunkId} name={chunkId}>
              {instanciasChunk.map((instancia) => (
                <AssetCanteiroNoe key={instancia.id} instancia={instancia} />
              ))}
            </group>
          )
        })}
      </group>
      <TarefasCanteiroNoe {...props} />
    </group>
  )
}
