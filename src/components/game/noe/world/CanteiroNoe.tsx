import { useMemo } from 'react'
import { ArcaCanteiroNoe } from './ArcaCanteiroNoe'
import { AssetCanteiroNoe } from './AssetCanteiroNoe'
import { selecionarInstanciasAssetsCanteiroNoe } from './canteiro'
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

  return (
    <group name="canteiro-noe-m1-m2">
      <ArcaCanteiroNoe />
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
