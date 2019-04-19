import { DataProxy } from 'apollo-cache'
import { oc } from 'ts-optchain'
import { Store } from 'vuex'

import EPISODE_LIST_QUERY from '@/common/queries/episode-list.graphql'
import LIST_QUERY from '@/views/list/list.graphql'
import {
  EpisodeListEpisodes,
  EpisodeListQuery,
  EpisodeListVariables,
  Provider,
} from '@/graphql/types'

import { EpisodeCache } from '@/lib/episode-cache'
import { getAnilistUserId } from '@/state/auth'
import { isNil } from '.'

export interface EpisodeMutationObject {
  animeId: number
  provider: Provider
  episodeNumber: number
}

const getEpisodes = (obj: { episodes: EpisodeListEpisodes[] | null } | null) =>
  oc(obj).episodes(null)

export const refetchListQuery = ($store: Store<any>) => {
  const userId = getAnilistUserId($store)

  if (!userId) return () => []

  return () => [
    {
      query: LIST_QUERY,
      variables: { userId },
    },
  ]
}

export const writeEpisodeProgressToCache = (
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
