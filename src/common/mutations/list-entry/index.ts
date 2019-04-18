import ANIME_PAGE_QUERY from '@/views/anime/anime.graphql'
import ADD_LIST_ENTRY from './add-entry.graphql'
import DELETE_LIST_ENTRY from './delete-entry.graphql'
import {
  AddListEntryMutation,
  DeleteListEntryMutation,
  MediaListStatus,
} from '@/graphql/types'

import { refetchListQuery } from '@/utils/cache'
import { Instance } from '@/types'

export const createListEntry = async (
  { $apollo, $store }: Instance,
  mediaId: number,
  status: MediaListStatus,
) =>
  $apollo.mutate<AddListEntryMutation>({
    mutation: ADD_LIST_ENTRY,
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

export const deleteListEntry = async (
  { $apollo, $store }: Instance,
  animeId: number,
  entryId: number,
) =>
  $apollo.mutate<DeleteListEntryMutation>({
    mutation: DELETE_LIST_ENTRY,
    variables: { id: entryId },
    refetchQueries: refetchListQuery($store),
    update: cache => {
      const data = cache.readQuery<any>({
        query: ANIME_PAGE_QUERY,
        variables: { id: animeId },
      })
      if (!data || !data.anime) return

      data.anime.mediaListEntry = null

      // cache.writeQuery({ query: ANIME_PAGE_QUERY, data })
      cache.writeData({ id: `MediaList:${entryId}`, data: null })
    },
  })
