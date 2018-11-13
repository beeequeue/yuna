import { DollarApollo } from 'vue-apollo/types/vue-apollo'

import { store } from '@/state/store'
import { updatePlaylistListEntry } from '@/state/app'
import { MediaListStatus } from '@/graphql-types'

import ANIME_PAGE_QUERY from './AnimePageQuery.graphql'
import UPDATE_PROGRESS_MUTATION from './UpdateProgressMutation.graphql'
import { UpdateProgressMutation, UpdateProgressMutation_SaveMediaListEntry } from './UpdateProgressMutation'
import SET_STATUS_MUTATION from './SetStatusMutation.graphql'
import { SetStatusMutation } from './SetStatusMutation'
import ADD_ENTRY_MUTATION from './AddEntryMutation.graphql'
import { AddEntryMutation } from './AddEntryMutation'
import { UpdateScoreMutation } from './UpdateScoreMutation';

export const setProgressMutation = async (
  apollo: DollarApollo<any>,
  id: number,
  progress: number,
  oldValues: Partial<UpdateProgressMutation_SaveMediaListEntry> = {},
) => {
  return apollo.mutate<UpdateProgressMutation>({
    mutation: UPDATE_PROGRESS_MUTATION,
    variables: { id, progress },
    optimisticResponse: {
      SaveMediaListEntry: {
        __typename: 'MediaList',
        id,
        progress,
        repeat: oldValues.repeat || 0,
        status: oldValues.status || MediaListStatus.CURRENT,
      },
    } as UpdateProgressMutation,
    update: (_cache, { data }) => {
      if (!data) return

      updatePlaylistListEntry(store, data.SaveMediaListEntry)
    }
  })
}

export const setStatusMutation = async (
  apollo: DollarApollo<any>,
  id: number,
  status: MediaListStatus,
) =>
  apollo.mutate<SetStatusMutation>({
    mutation: SET_STATUS_MUTATION,
    variables: { id, status },
  })

export const addEntryMutation = async (
  apollo: DollarApollo<any>,
  mediaId: number,
  status: MediaListStatus,
) =>
  apollo.mutate<AddEntryMutation>({
    mutation: ADD_ENTRY_MUTATION,
    variables: { mediaId, status },
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
    apollo: DollarApollo<any>,
    id: number,
    score: number,
    oldValues: Partial<UpdateProgressMutation_SaveMediaListEntry> = {}
  ) => {
    return apollo.mutate<UpdateScoreMutation>({
      mutation: UPDATE_PROGRESS_MUTATION,
      variables: { id, score },
      optimisticResponse: {
        SaveMediaListEntry: {
          __typename: 'MediaList',
          id,
          score,
          progress: oldValues.progress || 0,
          repeat: oldValues.repeat || 0,
          status: oldValues.status || MediaListStatus.CURRENT,
        },
      } as UpdateScoreMutation,
      update: (_cache, { data }) => {
        if (!data) return

        updatePlaylistListEntry(store, data.SaveMediaListEntry)
      }
    })
  }
