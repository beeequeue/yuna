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
  public static async getSeasonFromMalId(idMal: number): Promise<Episode[]> {
    const hit = seasonCache.has(idMal.toString())

    if (!hit) {
      let episodes

      try {
        episodes = await fetchEpisodesOfSeries(idMal)
      } catch (e) {
        return Promise.reject(e)
      }

      seasonCache.set(idMal.toString(), episodes)

      return episodes
    }

    return seasonCache.get(idMal.toString())
  }

  public static clear() {
    animeCache.clear()
    seasonCache.clear()
  }
}
