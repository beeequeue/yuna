import { DollarApollo } from 'vue-apollo/types/vue-apollo'

import ANIME_PAGE_QUERY from './AnimePageQuery.graphql'
import UPDATE_PROGRESS_MUTATION from './UpdateProgressMutation.graphql'
import SET_STATUS_MUTATION from './SetStatusMutation.graphql'
import ADD_ENTRY_MUTATION from './AddEntryMutation.graphql'

import { MediaListStatus } from '../graphql-types'

export const setProgressMutation = async (
  apollo: DollarApollo<any>,
  id: number,
  progress: number,
) =>
  apollo.mutate({
    mutation: UPDATE_PROGRESS_MUTATION,
    variables: { id, progress },
  })

export const setStatusMutation = async (
  apollo: DollarApollo<any>,
  id: number,
  status: MediaListStatus,
) =>
  apollo.mutate({
    mutation: SET_STATUS_MUTATION,
    variables: { id, status },
  })

export const addEntryMutation = async (
  apollo: DollarApollo<any>,
  mediaId: number,
  status: MediaListStatus,
) => apollo.mutate({
  mutation: ADD_ENTRY_MUTATION,
  variables: { mediaId, status },
  update: (store, { data }) => {
    if (!data) return

    const cache: any = store.readQuery({ query: ANIME_PAGE_QUERY, variables: { id: mediaId } })

    cache.Media.mediaListEntry = data.SaveMediaListEntry

    store.writeQuery({ query: ANIME_PAGE_QUERY, data: cache })
  }
})
