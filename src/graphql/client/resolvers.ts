import { DataProxy } from 'apollo-cache'
import { isNil, omit } from 'rambdax'

import EPISODES_QUERY from '@/graphql/PlayerEpisodes.graphql'
import {
  AnimePageQueryAnime,
  PlayerAnimeAnime,
  PlayerEpisodesEpisodes,
  PlayerEpisodesQuery,
  PlayerEpisodesVariables,
  Provider,
} from '@/graphql/types'
import { fetchEpisodesOfSeries, fetchRating } from '@/lib/myanimelist'
import { EpisodeRelations, getEpisodeRelations } from '@/lib/relations'

interface EpisodeVariables {
  id: number
  provider: Provider
}

interface RealProxy extends DataProxy {
  data: {
    data: {
      [key: string]:
        | undefined
        | {
            __typename: string
            [key: string]: any | undefined
          }
    }
  }
}

const cacheEpisodes = (cache: RealProxy, relations: EpisodeRelations) => {
  Object.entries(relations).forEach(([id, episodes]) => {
    cache.writeQuery<PlayerEpisodesQuery, PlayerEpisodesVariables>({
      query: EPISODES_QUERY,
      variables: { id: Number(id) },
      data: { episodes },
    })
  })
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
      { cache }: { cache: RealProxy },
    ): Promise<PlayerEpisodesEpisodes[] | null> => {
      if (provider === Provider.Crunchyroll) {
        const cachedAnime = cache.data.data[
          `Media:${id}`
        ] as PlayerAnimeAnime | null

        if (!cachedAnime || !cachedAnime.idMal) {
          throw new Error('Could not find Anime in cache!')
        }

        const unconfirmedEpisodes = await fetchEpisodesOfSeries(
          cachedAnime.idMal,
        )

        if (!unconfirmedEpisodes) return null

        const relations = getEpisodeRelations(id, unconfirmedEpisodes)

        cacheEpisodes(cache, omit(id.toString() as any, relations))

        return relations[id]
      }

      return null
    },
  },
}
