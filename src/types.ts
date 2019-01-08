import { Store } from 'vuex'
import { DollarApollo } from 'vue-apollo/types/vue-apollo'
import { MediaListStatus } from '@/graphql/types'

export interface Levels {
  [key: string]: number
}

export interface Stream {
  url: string
  progress: number
}

export interface Anime {
  title: string
  romajiTitle?: string
  description: string
  length: number
  landscapeImage: string
  portraitImage: string

  user?: {
    state: MediaListStatus
    progress: number
  }

  crunchyroll?: {
    id: string
    url: string
  }

  anilist: {
    id: number
    listEntryId?: number
  }
}

export interface Instance {
  $store: Store<any>
  $apollo: DollarApollo<any>
}
