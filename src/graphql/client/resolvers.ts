import { isNil } from 'rambdax'

import {
  AnimePageQueryAnime,
  PlayerAnimeAnime,
  PlayerEpisodesEpisodes,
  Provider,
} from '@/graphql/types'
import { fetchEpisodesOfSeries, fetchRating } from '@/lib/myanimelist'

interface EpisodeVariables {
  id: number
  provider: Provider
}

export const resolvers = {
  Media: {
    scoreMal: async (media: AnimePageQueryAnime): Promise<number | null> => {
      if (isNil(media) || isNil(media.idMal)) return null

      const result = await fetchRating(media.idMal)
      if (!result) return null

      return Number(result)
    },
  },
  Query: {
    Episodes: async (
      _: any,
      { id, provider }: EpisodeVariables,
      { cache }: any,
    ): Promise<PlayerEpisodesEpisodes[] | null> => {
      if (provider === Provider.Crunchyroll) {
        const cachedAnime = cache.data.data[
          `Media:${id}`
        ] as PlayerAnimeAnime | null
        if (!cachedAnime || !cachedAnime.idMal) {
          throw new Error('Could not find Anime in cache!')
        }

        const episodes = await fetchEpisodesOfSeries(cachedAnime.idMal)

        if (!episodes) return null

        const data = episodes.map((ep, i) => ({
          __typename: 'Episode' as 'Episode',
          provider: Provider.Crunchyroll,
          id: Number(ep.crunchyroll.id),
          title: ep.title,
          description: ep.description,
          duration: ep.duration,
          url: ep.crunchyroll.url,
          index: i,
          episodeNumber: ep.episodeNumber,
          thumbnail: ep.thumbnail,
        }))

        cache.writeData({ id: `Episodes:${id}:${provider}`, data })

        return data
      }

      return null
    },
  },
}
