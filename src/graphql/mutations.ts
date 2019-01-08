import { DataProxy } from 'apollo-cache'
import { Store } from 'vuex'

import EPISODE_LIST from '@/graphql/EpisodeList.graphql'
import {
  AddEntryMutationMutation,
  DeleteListEntryMutationMutation,
  EpisodeListEpisodes,
  EpisodeListQuery,
  EpisodeListVariables,
  MediaListStatus,
  SetStatusMutationMutation,
  UpdateProgressMutationMutation,
  UpdateProgressMutationSaveMediaListEntry,
  UpdateScoreMutationMutation,
} from '@/graphql/types'
import { getAnilistUserId } from '@/state/auth'
import { Instance } from '@/types'

import ADD_ENTRY_MUTATION from './AddEntryMutation.graphql'
import ANIME_PAGE_QUERY from './AnimePageQuery.graphql'
import DELETE_LIST_ENTRY_MUTATION from './DeleteListEntryMutation.graphql'
import LIST_QUERY from './ListQuery.graphql'
import SET_STATUS_MUTATION from './SetStatusMutation.graphql'
import UPDATE_PROGRESS_MUTATION from './UpdateProgressMutation.graphql'
import UPDATE_SCORE_MUTATION from './UpdateScoreMutation.graphql'

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

const writeEpisodeProgressToCache = (
  cache: DataProxy,
  episode: EpisodeListEpisodes,
  progress: number,
) => {
  const data = cache.readQuery<EpisodeListQuery, EpisodeListVariables>({
    query: EPISODE_LIST,
    variables: {
      id: episode.animeId,
    },
  })

  if (!data || !data.episodes) return

  cache.writeQuery<EpisodeListQuery>({
    query: EPISODE_LIST,
    data: {
      episodes: data.episodes.map(ep => ({
        ...ep,
        isWatched: progress >= ep.episodeNumber,
      })),
    },
  })
}

export const setEpisodeWatched = async (
  { $apollo, $store }: Instance,
  episode: EpisodeListEpisodes,
  listEntry: UpdateProgressMutationSaveMediaListEntry,
) => {
  const progress = episode.episodeNumber

  return $apollo.mutate<UpdateProgressMutationMutation>({
    mutation: UPDATE_PROGRESS_MUTATION,
    variables: { id: listEntry.id, progress },
    optimisticResponse: {
      SaveMediaListEntry: {
        __typename: 'MediaList',
        id: listEntry.id,
        progress,
        repeat: listEntry.repeat || 0,
        status: listEntry.status || MediaListStatus.Current,
      },
    } as UpdateProgressMutationMutation,
    refetchQueries: refetchListQuery($store),
    update: cache => {
      writeEpisodeProgressToCache(cache, episode, progress)
    },
  })
}

export const setEpisodeUnwatched = async (
  instance: Instance,
  episode: EpisodeListEpisodes,
  listEntry: UpdateProgressMutationSaveMediaListEntry,
) =>
  setEpisodeWatched(
    instance,
    {
      ...episode,
      episodeNumber: episode.episodeNumber - 1,
    },
    listEntry,
  )

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
