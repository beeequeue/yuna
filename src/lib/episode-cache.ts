import Store from 'electron-store'

import { EpisodeListEpisodes, Provider } from '@/graphql/types'

// interface VersionSchema {
//   __version: number
// }
interface EpisodeCacheSchema {
  [id: string]: {
    nextEpisodeAiringAt: number
    episodes: EpisodeListEpisodes[]
  }
}
const episodeCache = new Store<any>({
  name: 'episodeCache',
})

const CURRENT_VERSION = 1
let schemaVersion = episodeCache.get('__version', null)

if (schemaVersion !== CURRENT_VERSION) {
  if (schemaVersion == null) {
    episodeCache.clear()

    schemaVersion = 1
  }

  episodeCache.set('__version', schemaVersion)
}

export class EpisodeCache {
  public static get(
    animeId: number,
    provider: Provider,
  ): EpisodeCacheSchema[string] | null {
    return episodeCache.get(`${provider}:${animeId}`, null)
  }

  public static getNextEpisodeAiringAt(
    animeId: number,
    provider: Provider,
  ): number | null {
    return episodeCache.get(`${provider}:${animeId}.nextEpisodeAiringAt`, null)
  }

  public static set(
    animeId: number,
    provider: Provider,
    episodes: EpisodeListEpisodes[],
    nextEpisodeAiringAt: number | null,
  ) {
    episodeCache.set(`${provider}:${animeId}`, {
      nextEpisodeAiringAt,
      episodes,
    })
  }

  public static clear() {
    const version = episodeCache.get('__version')
    episodeCache.clear()
    episodeCache.set('__version', version)
  }
}
