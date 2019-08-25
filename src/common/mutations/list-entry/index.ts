import {
  AddToListMutation,
  AddToListVariables,
  DeleteFromListMutation,
  DeleteFromListVariables,
  MediaListStatus,
  Provider,
  RewatchMutation,
  SetScoreMutation,
  SetScoreSaveMediaListEntry,
  UpdateStatusMutation,
  UpdateStatusVariables,
} from '@/graphql/types'
import { ADD_TO_LIST, DELETE_FROM_LIST, UPDATE_STATUS } from '@/graphql/mutations'
import { SET_SCORE, START_REWATCHING } from '@/plugins/list/anilist/anilist-mutations'
import { EpisodeMutationObject, refetchListQuery, writeEpisodeProgressToCache } from '@/utils/cache'
import { Instance } from '@/types'

export const addToList = async ({ $apollo }: Instance, anilistId: number) =>
  $apollo.mutate<AddToListMutation>({
    mutation: ADD_TO_LIST,
    variables: { anilistId } as AddToListVariables,
  })

export const deleteFromList = async (
  { $apollo }: Instance,
  anilistId: number,
) =>
  $apollo.mutate<DeleteFromListMutation>({
    mutation: DELETE_FROM_LIST,
    variables: { anilistId } as DeleteFromListVariables,
  })

export const updateStatus = async (
  { $apollo, $store }: Instance,
  anilistId: number,
  status: MediaListStatus,
) =>
  $apollo.mutate<UpdateStatusMutation>({
    mutation: UPDATE_STATUS,
    variables: { anilistId, status } as UpdateStatusVariables,
    refetchQueries: refetchListQuery($store),
  })

export const startRewatching = async (
  { $apollo, $store }: Instance,
  id: number,
) => {
  await $apollo.mutate<RewatchMutation>({
    mutation: START_REWATCHING,
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
  oldValues: Partial<SetScoreSaveMediaListEntry> = {},
) => {
  return $apollo.mutate<SetScoreMutation>({
    mutation: SET_SCORE,
    variables: { id, score },
    optimisticResponse: {
      SaveMediaListEntry: {
        id,
        mediaId: oldValues.mediaId || 0,
        score,
        progress: oldValues.progress || 0,
        repeat: oldValues.repeat || 0,
        status: oldValues.status || MediaListStatus.Current,
      },
    },
  })
}
