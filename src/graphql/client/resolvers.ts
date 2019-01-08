import { DataProxy } from 'apollo-cache'
import gql from 'graphql-tag'
import { isNil, omit } from 'rambdax'

import EPISODES_QUERY from '@/graphql/EpisodeList.graphql'
import {
  AnimePageQueryAnime,
  EpisodeListEpisodes,
  EpisodeListQuery,
  EpisodeListVariables,
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
    cache.writeQuery<EpisodeListQuery, EpisodeListVariables>({
      query: EPISODES_QUERY,
      variables: { id: Number(id) },
      data: {
        episodes: episodes.map((ep: any) => ({ ...ep, isWatched: false })),
      },
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
    ): Promise<EpisodeListEpisodes[] | null> => {
      if (provider === Provider.Crunchyroll) {
        const data = cache.readFragment<{ idMal: number | null }>({
          id: `Media:${id}`,
          fragment: gql`
            fragment idMal on Media {
              idMal
            }
          `,
        })

        if (!data || !data || !data.idMal) {
          throw new Error('Could not find Anime in cache!')
        }

        let unconfirmedEpisodes

        try {
          unconfirmedEpisodes = await fetchEpisodesOfSeries(id, data.idMal)
        } catch (err) {
          throw new Error(err)
        }

        if (!unconfirmedEpisodes) return null

        const relations = getEpisodeRelations(id, unconfirmedEpisodes)

        cacheEpisodes(cache, omit(id.toString() as any, relations))

        return relations[id]
      }

      return null
    },
  },
  Episode: {
    isWatched: (
      episode: EpisodeListEpisodes,
      _: never,
      { cache }: { cache: RealProxy },
    ) => {
      const data = cache.readFragment<{
        mediaListEntry: { progress: number } | null
      }>({
        id: `Media:${episode.animeId}`,
        fragment: gql`
          fragment listEntry on Media {
            mediaListEntry {
              progress
            }
          }
        `,
      })

      if (!data || !data.mediaListEntry || !data.mediaListEntry.progress) {
        return false
      }

      return data.mediaListEntry.progress >= episode.episodeNumber
    },
  },
}
