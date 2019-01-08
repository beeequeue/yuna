import Store from 'electron-store'

import { EpisodeListEpisodes } from '@/graphql/types'
import { fetchEpisodesOfSeries, fetchRating } from '@/lib/myanimelist'

interface SeasonCacheSchema {
  [key: string]: {
    updatedAt: number
    episodes: EpisodeListEpisodes[]
    rating: string | null
    nextEpisodeAt: number | null
  }
}

const seasonCache = new Store<SeasonCacheSchema>({ name: 'seasonCache' })

const DAY = 1000 * 60 * 60 * 24
const WEEK = DAY * 7

interface IsStaleOptions {
  updatedAt: number
  nextEpisodeAt: number | null
}

const isStale = (
  { updatedAt, nextEpisodeAt }: IsStaleOptions,
  time: number,
) => {
  const normalStale = updatedAt + time < Date.now()
  const newEpisodeCameOut = (nextEpisodeAt || Infinity) < Date.now()

  return newEpisodeCameOut || normalStale
}

interface GetSeasonOptions {
  idMal: number
  nextAiringEpisode: { timeUntilAiring: number } | null
}

export class AnimeCache {
  public static async getSeasonFromMalId({
    idMal,
    nextAiringEpisode,
  }: GetSeasonOptions): Promise<EpisodeListEpisodes[]> {
    const hit = seasonCache.get(idMal.toString())

    if (!hit || isStale(hit, WEEK * 4)) {
      let episodes

      try {
        episodes = await fetchEpisodesOfSeries(idMal)
      } catch (e) {
        throw new Error(e)
      }

      const nextEpisodeAt =
        nextAiringEpisode &&
        Date.now() + nextAiringEpisode.timeUntilAiring * 1000

      seasonCache.set(idMal.toString(), {
        updatedAt: Date.now(),
        episodes,
        nextEpisodeAt,
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
