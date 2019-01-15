import Store from 'electron-store'

import { EpisodeListEpisodes, Provider } from '@/graphql/types'

interface EpisodeCacheSchema {
  [id: string]: {
    updatedAt: number
    episodes: EpisodeListEpisodes[]
  }
}
const episodeCache = new Store<EpisodeCacheSchema>({
  name: 'episodeCache',
})

export class EpisodeCache {
  public static get(
    animeId: number,
    provider: Provider,
  ): EpisodeCacheSchema[any] | null {
    return episodeCache.get(`${provider}:${animeId}`, null)
  }

  public static set(
    animeId: number,
    provider: Provider,
    episodes: EpisodeListEpisodes[],
  ) {
    episodeCache.set(`${provider}:${animeId}`, {
      updatedAt: Date.now(),
      episodes,
    })
  }

  public static clear() {
    episodeCache.clear()
  }
}
