import { DollarApollo } from 'vue-apollo/types/vue-apollo'
import { Store } from 'vuex'

import {
  AddEntryMutationMutation,
  DeleteListEntryMutationMutation,
  MediaListStatus,
  SetStatusMutationMutation,
  UpdateProgressMutationMutation, UpdateProgressMutationSaveMediaListEntry, UpdateScoreMutationMutation,
} from '@/graphql/types'
import { getAnilistUserId } from '@/state/auth'

import ADD_ENTRY_MUTATION from './AddEntryMutation.graphql'
import ANIME_PAGE_QUERY from './AnimePageQuery.graphql'
import DELETE_LIST_ENTRY_MUTATION from './DeleteListEntryMutation.graphql'
import LIST_QUERY from './ListQuery.graphql'
import SET_STATUS_MUTATION from './SetStatusMutation.graphql'
import UPDATE_PROGRESS_MUTATION from './UpdateProgressMutation.graphql'
import UPDATE_SCORE_MUTATION from './UpdateScoreMutation.graphql'

interface Instance {
  $store: Store<any>
  $apollo: DollarApollo<any>
}

const refetchListQuery = ($store: Store<any>) => {
  const userId = getAnilistUserId($store)

  if (!userId) return () => []

  return () => [
    {
      query: LIST_QUERY,
      variables: { userId },
    },
  ]
}

export const setProgressMutation = async (
  { $apollo, $store }: Instance,
  id: number,
  progress: number,
  oldValues: Partial<UpdateProgressMutationSaveMediaListEntry> = {},
) =>
  $apollo.mutate<UpdateProgressMutationMutation>({
    mutation: UPDATE_PROGRESS_MUTATION,
    variables: { id, progress },
    optimisticResponse: {
      SaveMediaListEntry: {
        __typename: 'MediaList',
        id,
        progress,
        repeat: oldValues.repeat || 0,
        status: oldValues.status || MediaListStatus.Current,
      },
    } as UpdateProgressMutationMutation,
    refetchQueries: refetchListQuery($store),
  })

export const setStatusMutation = async (
  { $apollo, $store }: Instance,
  id: number,
  status: MediaListStatus,
) =>
  $apollo.mutate<SetStatusMutationMutation>({
    mutation: SET_STATUS_MUTATION,
    variables: { id, status },
    refetchQueries: refetchListQuery($store),
  })

export const addEntryMutation = async (
  { $apollo, $store }: Instance,
  mediaId: number,
  status: MediaListStatus,
) =>
  $apollo.mutate<AddEntryMutationMutation>({
    mutation: ADD_ENTRY_MUTATION,
    variables: { mediaId, status },
    refetchQueries: refetchListQuery($store),
    update: (cache, { data }) => {
      if (!data) return

      const cachedData: any = cache.readQuery({
        query: ANIME_PAGE_QUERY,
        variables: { id: mediaId },
      })

      cachedData.anime.mediaListEntry = data.SaveMediaListEntry

      cache.writeQuery({ query: ANIME_PAGE_QUERY, data: cachedData })
    },
  })

export const setScoreMutation = async (
  { $apollo }: Instance,
  id: number,
  score: number,
  oldValues: Partial<UpdateProgressMutationSaveMediaListEntry> = {},
) =>
  $apollo.mutate<UpdateScoreMutationMutation>({
    mutation: UPDATE_SCORE_MUTATION,
    variables: { id, score },
    optimisticResponse: {
      SaveMediaListEntry: {
        __typename: 'MediaList',
        id,
        score,
        progress: oldValues.progress || 0,
        repeat: oldValues.repeat || 0,
        status: oldValues.status || MediaListStatus.Current,
      },
    },
  })

export const deleteListEntryMutation = async (
  { $apollo, $store }: Instance,
  animeId: number,
  entryId: number,
) =>
  $apollo.mutate<DeleteListEntryMutationMutation>({
    mutation: DELETE_LIST_ENTRY_MUTATION,
    variables: { id: entryId },
    refetchQueries: refetchListQuery($store),
    update: cache => {
      const data = cache.readQuery<any>({
        query: ANIME_PAGE_QUERY,
        variables: { id: animeId },
      })
      if (!data || !data.anime) return

      data.anime.mediaListEntry = null

      cache.writeQuery({ query: ANIME_PAGE_QUERY, data })
    },
  })
