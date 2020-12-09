import type { ApolloCache, DataProxy } from "@apollo/client/cache"
import gql from "graphql-tag"
import { EPISODE_LIST, LIST_VIEW_QUERY } from "@/graphql/documents/queries"
import {
  CacheAiringDataFragment,
  CachedAnimeListEntryFragment,
  EpisodeListEpisodes,
  EpisodeListQuery,
  EpisodeListVariables,
  ListViewListEntries,
  ListViewQuery,
  ListViewQueryVariables,
  Provider,
} from "@/graphql/generated/types"

import { EpisodeCache } from "@/lib/episode-cache"
import { EpisodeRelations } from "@/lib/relations"
import { isNil } from "."

export const getFragment = <R extends {}, V = void>(
  cache: ApolloCache<unknown>,
  { id, fragment, fragmentName, variables }: DataProxy.Fragment<V, R>,
): R | null => {
  try {
    return cache.readFragment<R, V>({ id, fragment, fragmentName, variables })
  } catch (e) {
    return null
  }
}

export const getIsWatched = (
  cache: ApolloCache<unknown>,
  animeId: number,
  episode: number,
) => {
  const data = getFragment<CachedAnimeListEntryFragment>(cache, {
    id: `Media:${animeId}`,
    fragment: gql`
      fragment CachedAnimeListEntry on Media {
        listEntry {
          progress
        }
      }
    `,
  })

  const progress = data?.listEntry?.progress
  if (isNil(progress)) {
    return false
  }

  // If episode number is 0 (prequel) only mark it was watched if episode 1 is watched
  if (episode === 0 && progress < 1) {
    return false
  }

  return progress >= episode
}

export const getCachedAnimeIdMal = (
  cache: ApolloCache<unknown>,
  animeId: number,
): number | null => {
  const data = getFragment<{ idMal: number | null }>(cache, {
    id: `Media:${animeId}`,
    fragment: gql`
      fragment CachedMALId on Media {
        idMal
      }
    `,
  })

  return data?.idMal ?? null
}

type CachedExternalLinks = {
  externalLinks: Array<{ site: string; url: string }>
}

export const getCachedExternalLinks = (
  cache: ApolloCache<unknown>,
  animeId: number,
): CachedExternalLinks["externalLinks"] | null => {
  const data = getFragment<CachedExternalLinks>(cache, {
    id: `Media:${animeId}`,
    fragment: gql`
      fragment CachedExternalLinks on Media {
        externalLinks {
          site
          url
        }
      }
    `,
  })

  return data?.externalLinks ?? null
}

const getNextEpisodeAiringAt = (
  cache: ApolloCache<unknown>,
  animeId: number,
): number | null => {
  const data = getFragment<CacheAiringDataFragment, null>(cache, {
    fragment: gql`
      fragment CacheAiringData on Media {
        nextAiringEpisode {
          airingAt
        }
      }
    `,
    id: `Media:${animeId}`,
  })

  const airingAt = data?.nextAiringEpisode?.airingAt

  return !isNil(airingAt) ? airingAt * 1000 : null
}

export const getSoftCachedEpisodes = (
  cache: ApolloCache<unknown>,
  animeId: number,
  provider: Provider,
): EpisodeListEpisodes[] | null => {
  try {
    const data = cache.readQuery<EpisodeListQuery, EpisodeListVariables>({
      query: EPISODE_LIST,
      variables: {
        id: animeId,
        provider,
      },
    })

    return data?.episodes || null
  } catch (e) {
    return null
  }
}

export const cacheEpisodes = (
  cache: ApolloCache<unknown>,
  episodes: EpisodeListEpisodes[],
) => {
  episodes = episodes.map((ep) => ({
    ...ep,
    isWatched:
      ep.isWatched || getIsWatched(cache, ep.animeId, ep.episodeNumber),
  }))

  if (episodes.length < 1) {
    return []
  }

  const { animeId, provider } = episodes[0]
  const nextEpisodeAiringAt = getNextEpisodeAiringAt(cache, animeId)

  cache.writeQuery<EpisodeListQuery, EpisodeListVariables>({
    query: EPISODE_LIST,
    variables: { id: animeId, provider },
    data: { episodes },
  })

  EpisodeCache.set(animeId, provider, episodes, nextEpisodeAiringAt)
}

export const cacheRelations = (
  cache: ApolloCache<unknown>,
  relations: EpisodeRelations,
) => {
  Object.values(relations).forEach((episodes: EpisodeListEpisodes[]) => {
    cacheEpisodes(cache, episodes)
  })
}

export type EpisodeMutationObject = {
  animeId: number
  provider: Provider
  episodeNumber: number
}

export const writeEpisodeProgressToCache = (
  cache: ApolloCache<unknown>,
  episode: EpisodeMutationObject,
) => {
  let episodes = getSoftCachedEpisodes(cache, episode.animeId, episode.provider)

  if (isNil(episodes)) {
    const data = EpisodeCache.get(episode.animeId, episode.provider)
    episodes = data?.episodes || null
  }

  if (isNil(episodes)) return

  episodes = episodes.map((ep) => ({
    ...ep,
    isWatched: getIsWatched(cache, episode.animeId, ep.episodeNumber),
  }))

  cacheEpisodes(cache, episodes)
}

export const removeFromCacheList = (
  cache: ApolloCache<unknown>,
  anilistId: number,
) => {
  for (let i = 1; i < 100; i++) {
    let data: ListViewQuery

    try {
      data = cache.readQuery<ListViewQuery, ListViewQueryVariables>({
        query: LIST_VIEW_QUERY,
        variables: {},
      })!

      const index = data.ListEntries.findIndex(
        (entry) => entry.mediaId === anilistId,
      )

      if (index === -1) continue

      const newData = { ListEntries: [...data.ListEntries] }
      newData.ListEntries.splice(index, 1)

      cache.writeQuery<ListViewQuery, ListViewQueryVariables>({
        query: LIST_VIEW_QUERY,
        variables: {},
        data: newData,
      })
    } catch (e) {
      break
    }
  }
}

export const addToCacheList = (
  cache: ApolloCache<unknown>,
  entry: ListViewListEntries,
) => {
  let data: ListViewQuery

  try {
    data = cache.readQuery<ListViewQuery, ListViewQueryVariables>({
      query: LIST_VIEW_QUERY,
      variables: {},
    })!
  } catch (e) {
    return
  }

  const newData = { ListEntries: [entry, ...data.ListEntries] }
  cache.writeQuery<ListViewQuery, ListViewQueryVariables>({
    query: LIST_VIEW_QUERY,
    variables: {},
    data: newData,
  })
}
