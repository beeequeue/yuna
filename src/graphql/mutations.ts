import { DataProxy } from 'apollo-cache'
import { Store } from 'vuex'
import { oc } from 'ts-optchain'

import {
  AddEntryMutationMutation,
  CacheEpisodesMutation,
  CacheEpisodesVariables,
  DeleteListEntryMutationMutation,
  EpisodeInput,
  EpisodeListEpisodes,
  EpisodeListQuery,
  EpisodeListVariables,
  MediaListStatus,
  Provider,
  RewatchMutationMutation,
  SetStatusMutationMutation,
  UpdateProgressMutationMutation,
  UpdateProgressMutationSaveMediaListEntry,
  UpdateScoreMutationMutation,
} from '@/graphql/types'

import { EpisodeCache } from '@/lib/episode-cache'
import { getAnilistUserId } from '@/state/auth'
import { isNil } from '@/utils'
import { Instance } from '@/types'

import ADD_ENTRY_MUTATION from './AddEntryMutation.graphql'
import ANIME_PAGE_QUERY from './AnimePageQuery.graphql'
import DELETE_LIST_ENTRY_MUTATION from './DeleteListEntryMutation.graphql'
import LIST_QUERY from './ListQuery.graphql'
import SET_STATUS_MUTATION from './SetStatusMutation.graphql'
import UPDATE_PROGRESS_MUTATION from './UpdateProgressMutation.graphql'
import UPDATE_SCORE_MUTATION from './UpdateScoreMutation.graphql'
import REWATCH_MUTATION from './RewatchMutation.graphql'
import CACHE_EPISODES_MUTATION from './CacheEpisodes.graphql'
import EPISODE_LIST_QUERY from './EpisodeList.graphql'

const getEpisodes = (obj: { episodes: EpisodeListEpisodes[] | null } | null) =>
  oc(obj).episodes(null)

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

export type EpisodeMutationObject = Pick<
  EpisodeListEpisodes,
  'animeId' | 'provider' | 'episodeNumber'
>
const writeEpisodeProgressToCache = (
  cache: DataProxy,
  episode: EpisodeMutationObject,
  progress: number,
) => {
  let softCachedData: EpisodeListQuery | null = null

  try {
    softCachedData = cache.readQuery<EpisodeListQuery, EpisodeListVariables>({
      query: EPISODE_LIST_QUERY,
      variables: {
        id: episode.animeId,
        provider: episode.provider,
      },
    })
  } catch (e) {
    // no-op
  }

  const hardCachedData = EpisodeCache.get(episode.animeId, episode.provider)
  let episodes = getEpisodes(softCachedData) || getEpisodes(hardCachedData)

  if (isNil(episodes)) return

  episodes = episodes.map(ep => ({
    ...ep,
    isWatched: progress >= ep.episodeNumber,
  }))

  cache.writeQuery<EpisodeListQuery>({
    query: EPISODE_LIST_QUERY,
    data: { episodes },
  })

  EpisodeCache.set(
    episode.animeId,
    episode.provider,
    episodes,
    hardCachedData!.nextEpisodeAiringAt,
  )
}

export const setEpisodeWatched = async (
  { $apollo, $store }: Instance,
  episode: EpisodeMutationObject,
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
  episode: EpisodeMutationObject,
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

export const rewatchMutation = async (
  { $apollo, $store }: Instance,
  id: number,
) => {
  await $apollo.mutate<RewatchMutationMutation>({
    mutation: REWATCH_MUTATION,
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

export const cacheEpisodes = async (
  { $apollo }: Instance,
  animeId: number,
  provider: Provider,
  episodes: EpisodeInput[],
) =>
  $apollo.mutate<CacheEpisodesMutation>({
    mutation: CACHE_EPISODES_MUTATION,
    variables: { id: animeId, provider, episodes } as CacheEpisodesVariables,
    refetchQueries: [
      {
        query: EPISODE_LIST_QUERY,
        variables: { id: animeId, provider } as EpisodeListVariables,
      },
    ],
  })
