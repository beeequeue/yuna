import ANIME_PAGE_QUERY from '@/views/anime/anime.graphql'
import CREATE_ENTRY from './create-entry.graphql'
import DELETE_ENTRY from './delete-entry.graphql'
import SET_STATUS from './set-status.graphql'
import REWATCH from './rewatch.graphql'
import SET_SCORE from './set-score.graphql'
import {
  CreateEntryMutation,
  DeleteEntryMutation,
  MediaListStatus,
  Provider,
  RewatchMutation,
  SetScoreMutation,
  SetStatusMutation,
  UpdateProgressSaveMediaListEntry,
} from '@/graphql/types'

import {
  EpisodeMutationObject,
  refetchListQuery,
  writeEpisodeProgressToCache,
} from '@/utils/cache'
import { Instance } from '@/types'

export const createListEntry = async (
  { $apollo, $store }: Instance,
  mediaId: number,
  status: MediaListStatus,
) =>
  $apollo.mutate<CreateEntryMutation>({
    mutation: CREATE_ENTRY,
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
  $apollo.mutate<DeleteEntryMutation>({
    mutation: DELETE_ENTRY,
    variables: { id: entryId },
    refetchQueries: refetchListQuery($store),
    update: cache => {
      const data = cache.readQuery<any>({
        query: ANIME_PAGE_QUERY,
        variables: { id: animeId },
      })
      if (!data || !data.anime) return

      data.anime.mediaListEntry = null
    },
  })

export const setStatus = async (
  { $apollo, $store }: Instance,
  id: number,
  status: MediaListStatus,
) =>
  $apollo.mutate<SetStatusMutation>({
    mutation: SET_STATUS,
    variables: { id, status },
    refetchQueries: refetchListQuery($store),
  })

export const startRewatching = async (
  { $apollo, $store }: Instance,
  id: number,
) => {
  await $apollo.mutate<RewatchMutation>({
    mutation: REWATCH,
    variables: { id },
    refetchQueries: refetchListQuery($store),
    update: (cache, { data }) => {
      if (!data) return

      const fakeEpisode: EpisodeMutationObject = {
        provider: Provider.Crunchyroll,
        animeId: data.SaveMediaListEntry!.mediaId,
        episodeNumber: 0,
      }
      writeEpisodeProgressToCache(cache, fakeEpisode, 0)
    },
  })
}

export const setScore = async (
  { $apollo }: Instance,
  id: number,
  score: number,
  oldValues: Partial<UpdateProgressSaveMediaListEntry> = {},
) =>
  $apollo.mutate<SetScoreMutation>({
    mutation: SET_SCORE,
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
