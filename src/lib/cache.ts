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
  public static async getSeasonFromMedia(
    malId: string | number,
  ): Promise<Episode[]> {
    const hit = seasonCache.has(malId)

    if (!hit) {
      const episodes = await fetchEpisodesOfSeries(malId)

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
