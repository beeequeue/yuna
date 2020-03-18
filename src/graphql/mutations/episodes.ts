import gql from 'graphql-tag'
import { EPISODE_LIST } from '@/graphql/documents/queries'
import { CACHE_EPISODES } from '@/graphql/documents/mutations'
import {
  CacheEpisodesMutation,
  CacheEpisodesVariables,
  EpisodeInput,
  EpisodeListVariables,
  Provider,
} from '@/graphql/generated/types'

import { Instance } from '@/types'

type CacheEpisodesAiring = {
  AiringSchedule: null | {
    id: number
    episode: number
    airingAt: number
  }
}

export const cacheEpisodes = async (
  { $apollo }: Instance,
  animeId: number,
  provider: Provider,
  episodes: EpisodeInput[],
) => {
  const { data } = await $apollo.query<CacheEpisodesAiring>({
    query: gql`
      query CacheEpisodesAiring($id: Int!) {
        AiringSchedule(mediaId: $id, notYetAired: true) {
          id
          episode
          airingAt
        }
      }
    `,
    variables: { id: animeId },
    errorPolicy: 'ignore',
  })

  const airing = (data.AiringSchedule?.airingAt ?? 0) * 1000

  return $apollo.mutate<CacheEpisodesMutation>({
    mutation: CACHE_EPISODES,
    variables: {
      id: animeId,
      provider,
      episodes,
      nextEpisodeAiringAt: airing !== 0 ? airing : null,
    } as CacheEpisodesVariables,
    refetchQueries: [
      {
        query: EPISODE_LIST,
        variables: {
          id: animeId,
          provider,
        } as EpisodeListVariables,
      },
    ],
  })
}
