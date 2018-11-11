import Store from 'electron-store'

import { fetchEpisodesOfSeries, fetchRating } from '@/lib/myanimelist'
import { Anime, Episode } from '@/types'

interface SeasonCacheSchema {
  [key: string]: {
    updatedAt: number
    episodes: Episode[]
    rating: string | null
  }
}

interface AnimeCacheSchema {
  [key: string]: Anime
}

const seasonCache = new Store<SeasonCacheSchema>({ name: 'seasonCache' })
const animeCache = new Store<AnimeCacheSchema>({ name: 'animeCache' })

const DAY = 1000 * 60 * 60 * 24
const WEEK = DAY * 7

const isStale = ({ updatedAt }: { updatedAt: number }, time: number) => {
  return updatedAt + time < Date.now()
}

export class AnimeCache {
  public static async getSeasonFromMalId(idMal: number): Promise<Episode[]> {
    const hit = seasonCache.get(idMal.toString())

    if (!hit || isStale(hit, DAY)) {
      let episodes

      try {
        episodes = await fetchEpisodesOfSeries(idMal)
      } catch (e) {
        throw new Error(e)
      }

      seasonCache.set(idMal.toString(), {
        updatedAt: Date.now(),
        episodes,
      })

      return episodes
    }

    return hit.episodes
  }

  public static async getMalRating(idMal: number) {
    const hit = seasonCache.get(idMal.toString())

    if (!hit || hit.rating == null) {
      return this.updateMalRating(idMal)
    }

    if (isStale(hit, WEEK)) {
      this.updateMalRating(idMal)
    }

    return hit.rating
  }

  public static clear() {
    animeCache.clear()
    seasonCache.clear()
  }

  private static async updateMalRating(idMal: number) {
    let rating

    try {
      rating = await fetchRating(idMal)
    } catch (e) {
      throw new Error(e)
    }

    seasonCache.set(`${idMal.toString()}.rating`, rating)

    return rating
  }
}
