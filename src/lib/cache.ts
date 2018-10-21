import Store from 'electron-store'

import { fetchEpisodesOfSeries } from '@/lib/myanimelist'
import { Anime, Episode } from '@/types'

interface SeasonCacheSchema {
  [key: string]: {
    updatedAt: number
    episodes: Episode[]
  }
}

interface AnimeCacheSchema {
  [key: string]: Anime
}

const seasonCache = new Store<SeasonCacheSchema>({ name: 'seasonCache' })
const animeCache = new Store<AnimeCacheSchema>({ name: 'animeCache' })

const DAY = 1000 * 60 * 60 * 24
const isStale = ({ updatedAt }: { updatedAt: number }) => {
  return updatedAt + DAY < Date.now()
}

export class AnimeCache {
  public static async getSeasonFromMalId(idMal: number): Promise<Episode[]> {
    const hit = seasonCache.get(idMal.toString())

    if (!hit || isStale(hit)) {
      let episodes

      try {
        episodes = await fetchEpisodesOfSeries(idMal)
      } catch (e) {
        return Promise.reject(e)
      }

      seasonCache.set(idMal.toString(), {
        updatedAt: Date.now(),
        episodes,
      })

      return episodes
    }

    return hit.episodes
  }

  public static clear() {
    animeCache.clear()
    seasonCache.clear()
  }
}
