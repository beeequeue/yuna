import Store from 'electron-store'

import { fetchEpisodesOfSeries } from '@/lib/myanimelist'
import { Anime, Episode } from '@/types'

interface SeasonCacheSchema {
  [key: string]: Episode[]
}

interface AnimeCacheSchema {
  [key: string]: Anime
}

const seasonCache = new Store<SeasonCacheSchema>({ name: 'seasonCache' })
const animeCache = new Store<AnimeCacheSchema>({ name: 'animeCache' })

export class AnimeCache {
  public static async getSeasonFromMalId(
    malId: string | number,
  ): Promise<Episode[]> {
    const hit = seasonCache.has(malId)

    if (!hit) {
      let episodes

      try {
        episodes = await fetchEpisodesOfSeries(malId)
      } catch (e) {
        return Promise.reject(e)
      }

      seasonCache.set(malId, episodes)

      return episodes
    }

    return seasonCache.get(malId)
  }

  public static clear() {
    animeCache.clear()
    seasonCache.clear()
  }
}
