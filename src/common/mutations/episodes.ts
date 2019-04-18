import gql from 'graphql-tag'
import { oc } from 'ts-optchain'

import EPISODE_LIST_QUERY from '@/graphql/EpisodeList.graphql'
import UPDATE_PROGRESS from './update-progress.graphql'
import CACHE_EPISODES from './cache-episodes.graphql'
import {
  CacheEpisodesMutation,
  CacheEpisodesVariables,
  EpisodeInput,
  EpisodeListVariables,
  MediaListStatus,
  Provider,
  UpdateProgressMutation,
} from '@/graphql/types'

import { Instance } from '@/types'
import { isNil } from '@/utils'
import {
  EpisodeMutationObject,
  refetchListQuery,
  writeEpisodeProgressToCache,
} from '@/utils/cache'

interface ListEntry {
  id: number
  status: MediaListStatus
  repeat: number
}

export const setProgress = async (
  { $apollo, $store }: Instance,
  options: EpisodeMutationObject,
) => {
  const progress = options.episodeNumber
  let listEntry: ListEntry | null = null

  try {
    listEntry = $apollo.provider.defaultClient.cache.readQuery({
      query: gql`
        query ProgressListEntry($id: Int!) {
          listEntry: MediaList(mediaId: $id) {
            id
            repeat
            status
          }
        }
      `,
      variables: {
        id: options.animeId,
      },
    })
  } catch (e) {
    /* no-op */
  }

  if (isNil(listEntry)) {
    throw new Error('Tried to update progress of show not in List!')
  }

  const optimisticResponse: UpdateProgressMutation = {
    SaveMediaListEntry: {
      __typename: 'MediaList',
      id: listEntry.id,
      progress,
      repeat: listEntry.repeat || 0,
      status: listEntry.status || MediaListStatus.Current,
    },
  }

  return $apollo.mutate<UpdateProgressMutation>({
    mutation: UPDATE_PROGRESS,
    variables: { id: listEntry.id, progress },
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
