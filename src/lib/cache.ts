import Store from 'electron-store'

import * as crunchyroll from '@/lib/crunchyroll'
import { Anime, Episode } from '@/types'

interface EpisodeCacheSchema {
  [key: string]: Episode
}

interface AnimeCacheSchema {
  [key: string]: Anime
}

const episodeCache = new Store<EpisodeCacheSchema>({ name: 'episodeCache' })
const animeCache = new Store<AnimeCacheSchema>({ name: 'animeCache' })

export class AnimeCache {
  public static async getAnime(id: string): Promise<Anime> {
    const hit = animeCache.has(id)

    if (!hit) {
      const fetchedAnime = await crunchyroll.fetchAnime(id)
      const fetchedEpisodes = await crunchyroll.fetchEpisodesOfAnime(id)

      animeCache.set(id, fetchedAnime)
      fetchedEpisodes.forEach(ep => animeCache.set(ep.crunchyroll.id, ep))

      return fetchedAnime
    }

    return animeCache.get(id)
  }

  public static async getEpisode(mediaId: string): Promise<Episode> {
    const hit = episodeCache.has(mediaId)

    if (!hit) {
      const episode = await crunchyroll.fetchEpisode(mediaId)

      episodeCache.set(episode.crunchyroll.id, episode)

      return episode
    }

    return episodeCache.get(mediaId)
  }

  public static clear() {
    animeCache.clear()
    episodeCache.clear()
  }
}

export const get = async () => {}
