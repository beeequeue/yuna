import { MediaListStatus } from '@/graphql-types'

export interface Levels {
  [key: string]: number
}

export interface Stream {
  url: string
}

export interface Episode {
  title: string
  description: string
  index: number
  episodeNumber: number
  duration: number
  progress: number | null
  thumbnail: string

  crunchyroll: {
    id: string
    url: string
    seriesId: string
    collection: string
  }
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
