import gql from 'graphql-tag'
import { oc } from 'ts-optchain'

import EPISODE_LIST_QUERY from '@/common/queries/episode-list.graphql'
import CACHE_EPISODES from './cache-episodes.graphql'
import {
  AniListEntryFragment,
  CacheEpisodesMutation,
  CacheEpisodesVariables,
  EpisodeInput,
  EpisodeListVariables,
  MediaListStatus,
  Provider,
  UpdateProgressMutation,
  UpdateProgressVariables,
} from '@/graphql/types'
import { ANILIST_LIST_ENTRY_FRAGMENT } from '@/graphql/documents/fragments'
import { UPDATE_PROGRESS } from '@/graphql/documents/mutations'

import { Instance } from '@/types'
import {
  EpisodeMutationObject,
  refetchListQuery,
  writeEpisodeProgressToCache,
} from '@/utils/cache'

export const setProgress = async (
  { $apollo, $store }: Instance,
  options: EpisodeMutationObject,
) => {
  const progress = options.episodeNumber
  let listEntry: AniListEntryFragment | null = null

  try {
    listEntry = $apollo.provider.defaultClient.cache.readFragment({
      fragment: ANILIST_LIST_ENTRY_FRAGMENT,
      id: `Media:${options.animeId}`,
    })
  } catch (e) {
    /* no-op */
  }

  const optimisticResponse: UpdateProgressMutation = {
    UpdateProgress: {
      __typename: 'ListEntry',
      id: oc(listEntry).id(-1),
      mediaId: options.animeId,
      progress,
      rewatched: oc(listEntry).repeat(0),
      status: oc(listEntry).status(MediaListStatus.Current),
      score: oc(listEntry).score(0),
    },
  }

  return $apollo.mutate<UpdateProgressMutation>({
    mutation: UPDATE_PROGRESS,
    variables: {
      anilistId: options.animeId,
      progress,
    } as UpdateProgressVariables,
    optimisticResponse,
    refetchQueries: refetchListQuery($store),
    update: cache => {
      writeEpisodeProgressToCache(cache, options, progress)
    },
  })
}

interface CacheEpisodesAiring {
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

  const airing = oc(data).AiringSchedule.airingAt(0) * 1000

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
        query: EPISODE_LIST_QUERY,
        variables: {
          id: animeId,
          provider,
        } as EpisodeListVariables,
      },
    ],
  })
}
