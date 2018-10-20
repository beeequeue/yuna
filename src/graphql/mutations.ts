import { DollarApollo } from 'vue-apollo/types/vue-apollo'

import { store } from '@/state/store'
import { updatePlaylistListEntry } from '@/state/app'
import { MediaListStatus } from '@/graphql-types'

import ANIME_PAGE_QUERY from './AnimePageQuery.graphql'
import UPDATE_PROGRESS_MUTATION from './UpdateProgressMutation.graphql'
import { UpdateProgressMutation } from './UpdateProgressMutation'
import SET_STATUS_MUTATION from './SetStatusMutation.graphql'
import { SetStatusMutation } from './SetStatusMutation'
import ADD_ENTRY_MUTATION from './AddEntryMutation.graphql'
import { AddEntryMutation } from './AddEntryMutation'

export const setProgressMutation = async (
  apollo: DollarApollo<any>,
  id: number,
  progress: number,
  oldValues: {
    repeat?: number | null
    status?: MediaListStatus | null
  } = {},
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
