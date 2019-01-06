import { isNil } from 'rambdax'

import { AnimePageQueryAnime, PlayerEpisodes, Provider } from '@/graphql/types'
import { fetchEpisodesOfSeries, fetchRating } from '@/lib/myanimelist'

interface EpisodeVariables {
  malId: number
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
      { malId, provider }: EpisodeVariables,
      { cache }: any,
    ): Promise<PlayerEpisodes[] | null> => {
      if (provider === Provider.Crunchyroll) {
        const episodes = await fetchEpisodesOfSeries(malId)

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

        cache.writeData({ id: `Episodes:${malId}:${provider}`, data })

        return data
      }

      return null
    },
  },
}
