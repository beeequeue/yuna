import { Store } from 'vuex'
import { DollarApollo } from 'vue-apollo/types/vue-apollo'
import { Provider } from '@/graphql/types'

export interface Levels {
  [key: string]: number
}

export interface Stream {
  url: string
  subtitles: string | null
  progress: number
}

export interface Instance {
  $store: Store<any>
  $apollo: DollarApollo<any>
}

export enum StreamingSource {
  Amazon = 'amazon',
  Animelab = 'animelab',
  Crunchyroll = 'crunchyroll',
  Funimation = 'funimation',
  Hidive = 'hidive',
  Hulu = 'hulu',
  Madman = 'madman',
  Netflix = 'netflix',
  Viewster = 'viewster',
  Viz = 'viz',
  Wakanim = 'wakanim',
}

export const SupportedSources = [
  StreamingSource.Crunchyroll,
  StreamingSource.Hidive,
]

export const CrunchyrollProviders = [
  Provider.Crunchyroll,
  Provider.CrunchyrollManual,
]
