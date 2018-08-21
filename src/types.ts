import { AnimeState } from '@/state/user'

export interface StreamData {
  subLanguage: string
  audioLanguage: string
  format: 'hls'
  streams: Array<{
    quality: 'adaptive' | 'low' | 'mid' | 'high' | 'ultra'
    expires: Date
    url: string
  }>
}

export interface Episode {
  name: string
  description: string
  index: number
  progress: number
  image: ImageSet

  crunchyroll: {
    id: string
    url: string
    series: string
    collection: string
    streamData: StreamData
  }
}

export interface Anime {
  name: string
  romajiName?: string
  description: string
  episodes: number
  landscapeImage: ImageSet
  portraitImage: ImageSet

  user?: {
    state: AnimeState
  }

  crunchyroll?: {
    id: string
    url: string
  }
}

export interface ImageSet {
  small: string
  large: string
  wide: string
  width: number
  height: number
}
