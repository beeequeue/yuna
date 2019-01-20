import { DataProxy } from 'apollo-cache'
import gql from 'graphql-tag'
import { isNil, pathOr } from 'rambdax'

import EPISODE_LIST from '@/graphql/EpisodeList.graphql'
import {
  AnimePageQueryAnime,
  EpisodeListEpisodes,
  EpisodeListQuery,
  EpisodeListVariables,
  Provider,
} from '@/graphql/types'
import { fetchEpisodesOfSeries, fetchRating } from '@/lib/myanimelist'
import { EpisodeRelations, getEpisodeRelations } from '@/lib/relations'
import { EpisodeCache } from '@/lib/episode-cache'

interface EpisodeVariables {
  id: number
  provider: Provider
}

interface RealProxy extends DataProxy {
  data: {
    data: {
      [key: string]:
        | undefined
        | {
            __typename: string
            [key: string]: any | undefined
          }
    }
  }
}

const cacheEpisodes = (
  cache: RealProxy,
  provider: Provider,
  relations: EpisodeRelations,
) => {
  Object.entries(relations).forEach(
    ([id, episodes]: [string, EpisodeListEpisodes[]]) => {
      episodes = episodes.map(ep => ({
        ...ep,
        isWatched: getIsWatched(cache, ep.animeId, ep.episodeNumber),
      }))

      cache.writeQuery<EpisodeListQuery, EpisodeListVariables>({
        query: EPISODE_LIST,
        variables: { id: Number(id) },
        data: {
          episodes,
        },
      })

      EpisodeCache.set(Number(id), provider, episodes)
    },
  )
}

const getIsWatched = (cache: RealProxy, animeId: number, episode: number) => {
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

const getNextEpisodeAiringAt = (
  cache: RealProxy,
  animeId: number,
): number | null => {
  const cachedNextEpisode = cache.readFragment<{
    nextAiringEpisode: { timeUntilAiring: number } | null
  }>({
    id: `Media:${animeId}`,
    fragment: gql`
      fragment nextEpisode on Media {
        nextAiringEpisode {
          timeUntilAiring
        }
      }
    `,
  })

  const timeUntilAiring = pathOr(
    null,
    ['nextAiringEpisode', 'timeUntilAiring'],
    cachedNextEpisode,
  )

  if (!timeUntilAiring) return null

  return Date.now() + timeUntilAiring * 1000
}

export const resolvers = {
  Media: {
    scoreMal: async (media: AnimePageQueryAnime): Promise<number | null> => {
      if (isNil(media) || isNil(media.idMal)) return null

      try {
        return fetchRating(media.idMal)
      } catch (err) {
        return null
      }
    },
  },
  Query: {
    Episodes: async (
      _: any,
      { id, provider }: EpisodeVariables,
      { cache }: { cache: RealProxy },
    ): Promise<EpisodeListEpisodes[] | null> => {
      const airingAt = getNextEpisodeAiringAt(cache, id)
      const isStale = airingAt != null && Date.now() >= airingAt
      let episodes: EpisodeListEpisodes[] | null = null
      let softCachedData

      if (!isStale) {
        try {
          softCachedData = cache.readQuery<
            EpisodeListQuery,
            EpisodeListVariables
          >({
            query: EPISODE_LIST,
            variables: { id: Number(id) },
          })
        } catch (err) {
          /* no-op */
        }

        if (softCachedData && softCachedData.episodes) {
          episodes = softCachedData.episodes
        }

        const hardCachedData = EpisodeCache.get(id, provider)

        if (hardCachedData && hardCachedData.episodes) {
          episodes = hardCachedData.episodes
        }
      }

      if (isStale || !episodes) {
        if (provider === Provider.Crunchyroll) {
          const data = cache.readFragment<{ idMal: number | null }>({
            id: `Media:${id}`,
            fragment: gql`
              fragment idMal on Media {
                idMal
              }
            `,
          })

          if (!data || !data || !data.idMal) {
            throw new Error('Could not find Anime in cache!')
          }

          let unconfirmedEpisodes

          try {
            unconfirmedEpisodes = await fetchEpisodesOfSeries(id, data.idMal)
          } catch (err) {
            throw new Error(err)
          }

          if (!unconfirmedEpisodes) return null

          const relations = getEpisodeRelations(id, unconfirmedEpisodes)

          cacheEpisodes(cache, provider, relations)

          episodes = relations[id]
        }
      }

      return episodes
    },
  },
  Episode: {
    isWatched: (
      episode: EpisodeListEpisodes,
      _: never,
      { cache }: { cache: RealProxy },
    ) => getIsWatched(cache, episode.animeId, episode.episodeNumber),
  },
}
