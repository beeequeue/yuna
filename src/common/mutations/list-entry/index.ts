import ANIME_PAGE_QUERY from '@/views/anime/anime.graphql'
import {
  AddToListMutation,
  AddToListVariables, AnimeViewMediaListEntry,
  DeleteEntryMutation,
  MediaListStatus,
  Provider,
  RewatchMutation,
  SetScoreMutation,
  SetScoreSaveMediaListEntry,
  SetStatusMutation,
} from '@/graphql/types'
import { ADD_TO_LIST } from '@/graphql/mutations'
import {
  DELETE_ENTRY,
  SET_SCORE,
  SET_STATUS,
  START_REWATCHING,
} from '@/plugins/list/anilist/mutations'
import {
  EpisodeMutationObject,
  refetchListQuery,
  writeEpisodeProgressToCache,
} from '@/utils/cache'
import { Instance } from '@/types'

export const addToList = async (
  { $apollo, $store }: Instance,
  anilistId: number,
) =>
  $apollo.mutate<AddToListMutation>({
    mutation: ADD_TO_LIST,
    variables: { anilistId } as AddToListVariables,
    refetchQueries: refetchListQuery($store),
    update: (cache, { data }) => {
      if (!data) return

      const cachedData: any = cache.readQuery({
        query: ANIME_PAGE_QUERY,
        variables: { id: anilistId },
      })

      const returnedEntry: AnimeViewMediaListEntry = {
        ...data.AddToList,
        // Needed since we get ListEntry back
        __typename: 'MediaList',
        repeat: data.AddToList.rewatched,
      }
      cachedData.anime.mediaListEntry = returnedEntry

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
