import { DollarApollo } from 'vue-apollo/types/vue-apollo'
import { oc } from 'ts-optchain'

import ANIME_PAGE_QUERY from '@/views/anime/anime.graphql'
import {
  AddToListMutation,
  AddToListVariables,
  AnimeViewQuery,
  AnimeViewQueryVariables,
  DeleteFromListMutation,
  DeleteFromListVariables,
  ListEntry,
  MediaListStatus,
  Provider,
  StartRewatchingMutation,
  StartRewatchingVariables,
  UpdateProgressMutation,
  UpdateProgressVariables,
  UpdateScoreMutation,
  UpdateScoreVariables,
  UpdateStatusMutation,
  UpdateStatusVariables,
} from '@/graphql/types'
import {
  ADD_TO_LIST,
  DELETE_FROM_LIST,
  START_REWATCHING,
  UPDATE_PROGRESS,
  UPDATE_SCORE,
  UPDATE_STATUS,
} from '@/graphql/documents/mutations'
import {
  addToCacheList,
  EpisodeMutationObject,
  removeFromCacheList,
  writeEpisodeProgressToCache,
} from '@/utils/cache'
import { Instance } from '@/types'
import { ListEntryWithoutMedia } from '@/plugins/list/plugin'

const getOptimisticResponse = (
  apollo: DollarApollo<any>,
  anilistId: number,
  newValues: Partial<Omit<ListEntry, '__typename' | 'mediaId'>>,
): ListEntryWithoutMedia => {
  const entry = oc(apollo.provider.defaultClient.cache as any).data.data[
    `ListEntry:${anilistId}`
  ]()

  return {
    __typename: 'ListEntry',
    id: oc(entry).id(-1),
    mediaId: anilistId,
    score: oc(entry).score(-1),
    progress: oc(entry).progress(-1),
    rewatched: oc(entry).rewatched(-1),
    status: oc(entry).status(MediaListStatus.Planning),
    ...newValues,
  }
}

export const addToList = async ({ $apollo }: Instance, anilistId: number) =>
  $apollo.mutate<AddToListMutation>({
    mutation: ADD_TO_LIST,
    variables: { anilistId } as AddToListVariables,
    update: (cache, { data }) => {
      if (!data) return

      addToCacheList(cache, data.AddToList)

      const variables: AnimeViewQueryVariables = { id: anilistId }
      const cachedData = cache.readQuery<AnimeViewQuery>({
        query: ANIME_PAGE_QUERY,
        variables,
      })

      cachedData!.anime!.listEntry = data.AddToList

      cache.writeQuery({
        query: ANIME_PAGE_QUERY,
        variables,
        data: cachedData,
      })
    },
  })

export const deleteFromList = async (
  { $apollo }: Instance,
  anilistId: number,
) => {
  const oldStatus = getOptimisticResponse($apollo, anilistId, {}).status

  return $apollo.mutate<DeleteFromListMutation>({
    mutation: DELETE_FROM_LIST,
    variables: { anilistId } as DeleteFromListVariables,
    update: cache => {
      removeFromCacheList(cache, anilistId, oldStatus)

      const variables: AnimeViewQueryVariables = { id: anilistId }
      let data

      try {
        data = cache.readQuery<AnimeViewQuery>({
          query: ANIME_PAGE_QUERY,
          variables,
        })
      } catch (e) {
        /* no op */
      }

      if (!data || !data.anime || !data.anime.listEntry) return

      data.anime.listEntry = null

      cache.writeQuery({
        query: ANIME_PAGE_QUERY,
        variables,
        data,
      })
    },
  })
}

export const updateStatus = async (
  { $apollo }: Instance,
  anilistId: number,
  status: MediaListStatus,
) => {
  const oldStatus = getOptimisticResponse($apollo, anilistId, {}).status

  return $apollo.mutate<UpdateStatusMutation>({
    mutation: UPDATE_STATUS,
    variables: { anilistId, status } as UpdateStatusVariables,
    optimisticResponse: {
      UpdateStatus: getOptimisticResponse($apollo, anilistId, {
        status,
      }),
    },
    update: (proxy, { data }) => {
      removeFromCacheList(proxy, anilistId, oldStatus)
      addToCacheList(proxy, data!.UpdateStatus)
    },
  })
}

export const startRewatching = async (
  { $apollo }: Instance,
  anilistId: number,
) => {
  await $apollo.mutate<StartRewatchingMutation>({
    mutation: START_REWATCHING,
    variables: { anilistId } as StartRewatchingVariables,
    optimisticResponse: {
      StartRewatching: getOptimisticResponse($apollo, anilistId, {
        status: MediaListStatus.Repeating,
        progress: 0,
      }),
    },
    update: (cache, { data }) => {
      if (!data) return

      addToCacheList(cache, data.StartRewatching)

      const fakeEpisode: EpisodeMutationObject = {
        provider: Provider.Crunchyroll,
        animeId: data.StartRewatching!.mediaId,
        episodeNumber: 0,
      }
      writeEpisodeProgressToCache(cache, fakeEpisode, 0)
    },
  })
}

export const updateScore = async (
  { $apollo }: Instance,
  anilistId: number,
  score: number,
) =>
  $apollo.mutate<UpdateScoreMutation>({
    mutation: UPDATE_SCORE,
    variables: { anilistId, score } as UpdateScoreVariables,
    optimisticResponse: {
      UpdateScore: getOptimisticResponse($apollo, anilistId, { score }),
    },
  })

export const setProgress = async (
  { $apollo }: Instance,
  options: EpisodeMutationObject,
) => {
  const progress = options.episodeNumber
  const variables: UpdateProgressVariables = {
    anilistId: options.animeId,
    progress,
  }
  const oldStatus = getOptimisticResponse($apollo, options.animeId, {}).status

  return $apollo.mutate<UpdateProgressMutation>({
    mutation: UPDATE_PROGRESS,
    variables,
    optimisticResponse: {
      UpdateProgress: getOptimisticResponse($apollo, options.animeId, {
        progress,
      }),
    },
    update: (cache, { data }) => {
      if (!data) return

      if (oldStatus !== data.UpdateProgress.status) {
        removeFromCacheList(cache, options.animeId, oldStatus)
        addToCacheList(cache, data.UpdateProgress)
      }

      writeEpisodeProgressToCache(cache, options, progress)
    },
  })
}
