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
  MediaListEntryFragment,
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
import { MEDIA_LIST_ENTRY_FRAGMENT } from '@/graphql/documents/fragments'
import {
  EpisodeMutationObject,
  getFragment,
  writeEpisodeProgressToCache,
} from '@/utils/cache'
import { Instance } from '@/types'

const getOptimisticResponse = (
  apollo: DollarApollo<any>,
  anilistId: number,
  newValues: Partial<Omit<ListEntry, '__typename' | 'mediaId'>>,
): ListEntry => {
  const media = getFragment<MediaListEntryFragment>(
    apollo.provider.defaultClient.cache,
    {
      id: `Media:${anilistId}`,
      fragment: MEDIA_LIST_ENTRY_FRAGMENT,
      fragmentName: MEDIA_LIST_ENTRY_FRAGMENT.name,
    },
  )

  return {
    __typename: 'ListEntry',
    id: oc(media).listEntry.id(-1),
    mediaId: anilistId,
    score: oc(media).listEntry.score(-1),
    progress: oc(media).listEntry.progress(-1),
    rewatched: oc(media).listEntry.rewatched(-1),
    status: oc(media).listEntry.status(MediaListStatus.Planning),
    ...newValues,
  }
}

export const addToList = async ({ $apollo }: Instance, anilistId: number) =>
  $apollo.mutate<AddToListMutation>({
    mutation: ADD_TO_LIST,
    variables: { anilistId } as AddToListVariables,
    update: (cache, { data }) => {
      if (!data) return

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
) =>
  $apollo.mutate<DeleteFromListMutation>({
    mutation: DELETE_FROM_LIST,
    variables: { anilistId } as DeleteFromListVariables,
    update: cache => {
      const variables: AnimeViewQueryVariables = { id: anilistId }
      const data = cache.readQuery<AnimeViewQuery>({
        query: ANIME_PAGE_QUERY,
        variables,
      })

      if (!data || !data.anime || !data.anime.listEntry) return

      data.anime.listEntry = null

      cache.writeQuery({
        query: ANIME_PAGE_QUERY,
        variables,
        data,
      })
    },
  })

export const updateStatus = async (
  { $apollo }: Instance,
  anilistId: number,
  status: MediaListStatus,
) =>
  $apollo.mutate<UpdateStatusMutation>({
    mutation: UPDATE_STATUS,
    variables: { anilistId, status } as UpdateStatusVariables,
    optimisticResponse: {
      UpdateStatus: getOptimisticResponse($apollo, anilistId, { status }),
    },
  })

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

  return $apollo.mutate<UpdateProgressMutation>({
    mutation: UPDATE_PROGRESS,
    variables,
    optimisticResponse: {
      UpdateProgress: getOptimisticResponse($apollo, options.animeId, {
        progress,
      }),
    },
    update: cache => {
      writeEpisodeProgressToCache(cache, options, progress)
    },
  })
}
