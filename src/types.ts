import { Store } from 'vuex'
import { DollarApollo } from 'vue-apollo/types/vue-apollo'

export interface Levels {
  [key: string]: number
}

export interface Stream {
  url: string
  progress: number
}

export interface Instance {
  $store: Store<any>
  $apollo: DollarApollo<any>
}

export enum StreamingSource {
  Crunchyroll = 'crunchyroll',
  Hulu = 'hulu',
  Hidive = 'hidive',
  Animelab = 'animelab',
  Funimation = 'funimation',
  Amazon = 'amazon',
}

export const SupportedSources = [
  StreamingSource.Crunchyroll,
  StreamingSource.Hidive,
]

export interface SelectedEpisode {
  id: number
  epNumber: number
}
