import { DataProxy } from 'apollo-cache'
import gql from 'graphql-tag'
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
import { EpisodeRelations } from '@/lib/relations'
import { getAnilistUserId } from '@/state/auth'
import { isNil } from '.'

export const getIsWatched = (
  cache: DataProxy,
  animeId: number,
  episode: number,
) => {
  const data = cache.readFragment<{
    mediaListEntry: { progress: number } | null
  }>({
    id: `Media:${animeId}`,
    fragment: gql`
      fragment listEntry on Media {
        mediaListEntry {
          progress
        }
      }
    `,
  })

  if (!data || !data.mediaListEntry || !data.mediaListEntry.progress) {
    return false
  }

  return data.mediaListEntry.progress >= episode
}

interface CachedAiringData {
  nextAiringEpisode: {
    airingAt: number
  }
}

const getNextEpisodeAiringAt = (
  cache: DataProxy,
  animeId: number,
): number | null => {
  try {
    const data = cache.readFragment<CachedAiringData, void>({
      fragment: gql`
        fragment CacheAiringData on Media {
          nextAiringEpisode {
            airingAt
          }
        }
      `,
      id: `Media:${animeId}`,
    })

    const airingAt = oc(data).nextAiringEpisode.airingAt()

    return !isNil(airingAt) ? airingAt * 1000 : null
  } catch (err) {
    return null
  }
}

const getSoftCachedEpisodes = (
  cache: DataProxy,
  animeId: number,
  provider: Provider,
): EpisodeListEpisodes[] | null => {
  try {
    const data = cache.readQuery<EpisodeListQuery, EpisodeListVariables>({
      query: EPISODE_LIST_QUERY,
      variables: {
        id: animeId,
        provider,
      },
    })

    return oc(data).episodes() || null
  } catch (e) {
    return null
  }
}

export const cacheEpisodes = (
  cache: DataProxy,
  episodes: EpisodeListEpisodes[],
) => {
  episodes = episodes.map(ep => ({
    ...ep,
    isWatched: getIsWatched(cache, ep.animeId, ep.episodeNumber),
  }))

  if (episodes.length < 1) {
    return []
  }

  const { animeId, provider } = episodes[0]
  let nextEpisodeAiringAt = getNextEpisodeAiringAt(cache, animeId)

  cache.writeQuery<EpisodeListQuery, EpisodeListVariables>({
    query: EPISODE_LIST_QUERY,
    variables: { id: animeId, provider },
    data: { episodes },
  })

  EpisodeCache.set(animeId, provider, episodes, nextEpisodeAiringAt)
}

export const cacheRelations = (
  cache: RealProxy,
  relations: EpisodeRelations,
) => {
  Object.values(relations).forEach((episodes: EpisodeListEpisodes[]) => {
    cacheEpisodes(cache, episodes)
  })
}

export interface EpisodeMutationObject {
  animeId: number
  provider: Provider
  episodeNumber: number
}

export const writeEpisodeProgressToCache = (
  cache: DataProxy,
  episode: EpisodeMutationObject,
  progress: number,
) => {
  let episodes = getSoftCachedEpisodes(cache, episode.animeId, episode.provider)

  if (isNil(episodes)) {
    const data = EpisodeCache.get(episode.animeId, episode.provider)
    episodes = oc(data).episodes() || null
  }

  if (isNil(episodes)) return

  episodes = episodes.map(ep => ({
    ...ep,
    isWatched: progress >= ep.episodeNumber,
  }))

  cacheEpisodes(cache, episodes)
}

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
