import type {
  AssetCriacaoId,
  EntradaManifestoAssetCriacao,
  ManifestoAssetsCriacao,
} from '../components/game/creation/progression'

const fonteKenney = 'https://kenney.nl/assets/nature-kit'
const diretorioKenney = '/models/creation/shared/kenney'
const fonteAnimaisQuaternius = 'https://quaternius.com/packs/farmanimal.html'
const fonteHumanosQuaternius =
  'https://quaternius.com/packs/universalbasecharacters.html'
const diretorioQuaternius = '/models/creation/shared/quaternius'

const hashesKenney = {
  cliffLargeStone:
    'd63595d0a8727a7a339dd315117fbb85e000224c0add26b6cc907054df046dac',
  cliffTopStone:
    '0327759fe95f6be7e263a2f07bf72f212a8df3e16ef1240643f5641a76ec0ec7',
  flowerPurpleA:
    'f6fc34c96a03420a74fe36d4c2d0ec88f15204fcad99cd1416c3c4ecb22e48c4',
  flowerRedA:
    '171930b7789ddbf735af3745576b5393750beb9133b9ff4a444bb6bb2986c020',
  flowerYellowA:
    '8a3b08cd2ca411c21f9c581d5bda651d78b13c50cba45ad8fa0389398ead6d1d',
  grass:
    '260e41d3e5f2472492ed7b475c5b92a30b13ce2bad408535b5ff50574d4575e7',
  grassLarge:
    'af49a595624abca7249824eeefb944d4baf974abeeb5b16110d175da3563d6cd',
  groundGrass:
    'da741e8ab34ca70c0c85ccda21538558a798188db2f1e265885bcdd226a5cca2',
  groundPathStraight:
    '86a1e88aaa028ccdfb98b6653c282c6aadb0fbccf9c4de00a834516b9bf79d37',
  groundRiverStraight:
    'd1061c7ab8d883fb26177e7cc36b2564b0a437620465c24f1a29629423cda096',
  plantBushDetailed:
    '2e0487020d68ccf664435db9d829c78ae00e6d2785ee3ec10b9f89cc70a10406',
  platformGrass:
    '74105fc9912c97e7809264dd69621863e0ddfd6ab92136f05918eda436ee898b',
  rockLargeA:
    '6dd15390fd96501dcd1454765a17ba61dbbd8d47705dfe5149c8dd92b353ce25',
  treeDefault:
    '562d29638c902de3c7bee465d3a53bb77117efbc392ae04ed894faf6b5dc691d',
  treeDetailed:
    'c041daf2f0fb1d49e4325227cbcd58667adbe51e9b55e8c1f0a94b74cc521b3b',
  treeFat:
    '84b262c5dda3a91ac6c95f9d8b23a0ebbb1951d678c0e1375d3e32623cc43ee2',
  treeOak:
    'd7fd8773674928c50c11b66d12c636d49bdcc15a8b1c7fbb98e6f63a3439a3f3',
} as const

const hashesQuaternius = {
  ovelha: 'd295beed1d28f1eee2af209c637aebaa928a280652040d72627eb84e7f69ffb8',
  adao: '624475f7e4d5d410286cfe7007301380ddaa4d12d24b9ede63ab73dea2af0b7e',
  eva: 'e59f51bd141eb2d71a712fb3acd8e1869d235833dbdfbbcf6b356d84fd58b0ef',
} as const

type EntradaSemLicenca = Omit<EntradaManifestoAssetCriacao, 'licenca'>

function caminho(nome: string) {
  return `${diretorioKenney}/${nome}`
}

function entradaKenney(
  dados: EntradaSemLicenca,
  sha256: string,
): EntradaManifestoAssetCriacao {
  return {
    ...dados,
    licenca: {
      urlFonte: fonteKenney,
      criador: 'Kenney',
      identificador: 'CC0-1.0',
      sha256,
    },
  }
}

function entradaQuaternius(
  dados: EntradaSemLicenca,
  urlFonte: string,
  sha256: string,
): EntradaManifestoAssetCriacao {
  return {
    ...dados,
    licenca: {
      urlFonte,
      criador: 'Quaternius',
      identificador: 'CC0-1.0',
      sha256,
    },
  }
}

/**
 * Curated, independently loadable Creation chunks.
 *
 * Kenney source GLBs remain unmodified; Quaternius character sources are
 * converted or recompressed as documented beside the outputs. Ground and
 * river files are visual tiles, while collision remains owned by the runtime.
 * Audio, VFX, lion and giraffe stay omitted instead of receiving invented
 * paths.
 */
export const manifestoAssetsCriacao: ManifestoAssetsCriacao = {
  versao: 1,
  entradas: [
    entradaKenney(
      {
        id: 'terreno-criacao',
        arquivo: caminho('ground_grass.glb'),
        tipo: 'ambiente',
        momentos: ['ceu-terra-aguas'],
        carregamento: 'momento-ativo',
        escala: 1,
        eixoFrontal: '+z',
      },
      hashesKenney.groundGrass,
    ),
    entradaKenney(
      {
        id: 'rios',
        arquivo: caminho('ground_riverStraight.glb'),
        tipo: 'ambiente',
        momentos: ['ceu-terra-aguas', 'eden'],
        carregamento: 'compartilhado',
        escala: 1,
        eixoFrontal: '+z',
      },
      hashesKenney.groundRiverStraight,
    ),
    entradaKenney(
      {
        id: 'montanhas',
        arquivo: caminho('cliff_large_stone.glb'),
        tipo: 'ambiente',
        momentos: ['ceu-terra-aguas'],
        carregamento: 'momento-ativo',
        escala: 1,
        eixoFrontal: '+z',
      },
      hashesKenney.cliffLargeStone,
    ),
    entradaKenney(
      {
        id: 'arvores',
        arquivo: caminho('tree_default.glb'),
        tipo: 'prop',
        momentos: ['natureza'],
        carregamento: 'momento-ativo',
        escala: 1,
        eixoFrontal: '+z',
      },
      hashesKenney.treeDefault,
    ),
    entradaKenney(
      {
        id: 'arbustos',
        arquivo: caminho('plant_bushDetailed.glb'),
        tipo: 'prop',
        momentos: ['natureza'],
        carregamento: 'momento-ativo',
        escala: 1,
        eixoFrontal: '+z',
      },
      hashesKenney.plantBushDetailed,
    ),
    entradaKenney(
      {
        id: 'flores',
        arquivo: caminho('flower_purpleA.glb'),
        tipo: 'prop',
        momentos: ['natureza'],
        carregamento: 'momento-ativo',
        escala: 1,
        eixoFrontal: '+z',
      },
      hashesKenney.flowerPurpleA,
    ),
    entradaKenney(
      {
        id: 'grama',
        arquivo: caminho('grass_large.glb'),
        tipo: 'prop',
        momentos: ['natureza'],
        carregamento: 'momento-ativo',
        escala: 1,
        eixoFrontal: '+z',
      },
      hashesKenney.grassLarge,
    ),
    entradaQuaternius(
      {
        id: 'ovelha',
        arquivo: `${diretorioQuaternius}/farm-animals/sheep.glb`,
        tipo: 'personagem',
        momentos: ['criaturas'],
        carregamento: 'momento-ativo',
        escala: 1,
        eixoFrontal: '+z',
      },
      fonteAnimaisQuaternius,
      hashesQuaternius.ovelha,
    ),
    entradaKenney(
      {
        id: 'jardim-eden',
        arquivo: caminho('platform_grass.glb'),
        tipo: 'ambiente',
        momentos: ['eden'],
        carregamento: 'momento-ativo',
        escala: 1,
        eixoFrontal: '+z',
      },
      hashesKenney.platformGrass,
    ),
    entradaKenney(
      {
        id: 'arvore-central',
        arquivo: caminho('tree_detailed.glb'),
        tipo: 'marco',
        momentos: ['eden'],
        carregamento: 'momento-ativo',
        escala: 1,
        eixoFrontal: '+z',
      },
      hashesKenney.treeDetailed,
    ),
    entradaKenney(
      {
        id: 'rios-eden',
        arquivo: caminho('ground_riverStraight.glb'),
        tipo: 'ambiente',
        momentos: ['eden'],
        carregamento: 'compartilhado',
        escala: 1,
        eixoFrontal: '+z',
      },
      hashesKenney.groundRiverStraight,
    ),
    entradaQuaternius(
      {
        id: 'adao',
        arquivo: `${diretorioQuaternius}/universal-base-characters/adam.glb`,
        tipo: 'personagem',
        momentos: ['adao-e-eva'],
        carregamento: 'momento-ativo',
        escala: 1,
        eixoFrontal: '+z',
      },
      fonteHumanosQuaternius,
      hashesQuaternius.adao,
    ),
    entradaQuaternius(
      {
        id: 'eva',
        arquivo: `${diretorioQuaternius}/universal-base-characters/eve.glb`,
        tipo: 'personagem',
        momentos: ['adao-e-eva'],
        carregamento: 'momento-ativo',
        escala: 1,
        eixoFrontal: '+z',
      },
      fonteHumanosQuaternius,
      hashesQuaternius.eva,
    ),
    entradaKenney(
      {
        id: 'arvore-conhecimento',
        arquivo: caminho('tree_oak.glb'),
        tipo: 'marco',
        momentos: ['fruto-escolha'],
        carregamento: 'momento-ativo',
        escala: 1,
        eixoFrontal: '+z',
      },
      hashesKenney.treeOak,
    ),
  ],
}

/** Returns an entry by the stable Creation asset ID. */
export function obterManifestoAssetCriacao(
  id: AssetCriacaoId,
): EntradaManifestoAssetCriacao | undefined {
  return manifestoAssetsCriacao.entradas.find((entrada) => entrada.id === id)
}
