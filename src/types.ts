import { Store } from 'vuex'
import { DollarApollo } from 'vue-apollo/types/vue-apollo'
import { Provider } from '@/graphql/generated/types'

export type Maybe<T> = T | null | undefined

export type DeepPartial<T> = T extends Function
  ? T
  : T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T

export enum SupportedMediaKeys {
  MediaPlayPause = 'PLAYER_PLAY_PAUSE',
  MediaStop = 'PLAYER_STOP',
  MediaNextTrack = 'PLAYER_NEXT',
  MediaPreviousTrack = 'PLAYER_PREVIOUS',
}

export type Levels = {
  [key: string]: number
}

export type Stream = {
  url: string
  subtitles: [string, string][]
  progress: number
}

export type Instance = {
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

export type SelectItem = { label: string; value: string }

export type GitHubRelease = {
  id: number
  tag_name: string
  name: string
  body: string
  html_url: string
  published_at: string
}
