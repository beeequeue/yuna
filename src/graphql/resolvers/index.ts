import { DataProxy } from 'apollo-cache'
import gql from 'graphql-tag'
import { oc } from 'ts-optchain'

import EPISODE_LIST from '@/common/queries/episode-list.graphql'
import {
  AnimeViewAnime,
  CacheEpisodesVariables,
  EpisodeListEpisodes,
  EpisodeListQuery,
  EpisodeListVariables,
  Provider,
} from '@/graphql/types'

import { fetchEpisodesOfSeries, fetchRating } from '@/lib/myanimelist'
import { EpisodeRelations, getEpisodeRelations } from '@/lib/relations'
import { EpisodeCache } from '@/lib/episode-cache'
import { AniDB } from '@/lib/anidb'
import { Hidive } from '@/lib/hidive'
import { isNil, propEq } from '@/utils'

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

interface CachedAnime {
  idMal: number | null
  nextAiringEpisode: null | {
    airingAt: number
  }
  externalLinks: Array<{ site: string; url: string }>
}

const cacheEpisodes = (
  cache: RealProxy,
  provider: Provider,
  relations: EpisodeRelations,
  nextEpisodeAiringAt: number | null,
) => {
  Object.entries(relations).forEach(
    ([id, episodes]: [string, EpisodeListEpisodes[]]) => {
      episodes = episodes.map(ep => ({
        ...ep,
        isWatched: getIsWatched(cache, ep.animeId, ep.episodeNumber),
      }))

      cache.writeQuery<EpisodeListQuery, EpisodeListVariables>({
        query: EPISODE_LIST,
        variables: { id: Number(id), provider },
        data: {
          episodes,
        },
      })

      EpisodeCache.set(Number(id), provider, episodes, nextEpisodeAiringAt)
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

export const resolvers = {
  Query: {
    Episodes: async (
      _: any,
      { id, provider }: EpisodeVariables,
      { cache }: { cache: RealProxy },
    ): Promise<EpisodeListEpisodes[] | null> => {
      const nextEpisodeAiringAt = EpisodeCache.getNextEpisodeAiringAt(
        id,
        provider,
      )
      const isStale =
        !isNil(nextEpisodeAiringAt) && Date.now() >= nextEpisodeAiringAt

      let episodes: EpisodeListEpisodes[] | null = null
      let softCachedData

      if (!isStale) {
        try {
          softCachedData = cache.readQuery<
            EpisodeListQuery,
            EpisodeListVariables
          >({
            query: EPISODE_LIST,
            variables: { id: Number(id), provider },
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
        const data = cache.readFragment<CachedAnime>({
          id: `Media:${id}`,
          fragment: gql`
            fragment cachedAnime on Media {
              idMal
              nextAiringEpisode {
                airingAt
              }
              externalLinks {
                site
                url
              }
            }
          `,
        })
        const airingAt = oc(data).nextAiringEpisode.airingAt(-1) * 1000

        if (!data || !data || !data.idMal) {
          throw new Error('Could not find Anime in cache!')
        }

        if (
          [Provider.Crunchyroll, Provider.CrunchyrollManual].includes(provider)
        ) {
          let unconfirmedEpisodes

          try {
            unconfirmedEpisodes = await fetchEpisodesOfSeries(id, data.idMal)
          } catch (err) {
            throw new Error(err)
          }

          if (unconfirmedEpisodes == null || unconfirmedEpisodes.length === 0) {
            try {
              unconfirmedEpisodes = await AniDB.getEpisodesForAnime(id)
            } catch (err) {
              throw new Error(err)
            }
          }

          if (unconfirmedEpisodes == null) return null

          const episodesWithCorrectProvider = unconfirmedEpisodes.map(ep => ({
            ...ep,
            provider: provider,
          }))

          const relations = getEpisodeRelations(id, episodesWithCorrectProvider)

          cacheEpisodes(
            cache,
            provider,
            relations,
            airingAt < 0 ? null : airingAt,
          )

          episodes = relations[id]
        } else if (provider === Provider.Hidive) {
          const hidiveLink = data.externalLinks.find(propEq('site', 'Hidive'))

          if (isNil(hidiveLink))
            throw new Error('Could not find link to Hidive.')

          let unconfirmedEpisodes: EpisodeListEpisodes[] | null = null
          try {
            unconfirmedEpisodes = (await Hidive.fetchEpisodesByUrl(
              id,
              hidiveLink.url,
            )) as any
          } catch (err) {
            throw new Error(err)
          }

          if (isNil(unconfirmedEpisodes)) {
            return []
          }

          const relations = getEpisodeRelations(id, unconfirmedEpisodes)

          cacheEpisodes(cache, Provider.Hidive, relations, nextEpisodeAiringAt)

          episodes = relations[id]
        }
      }

      return episodes
    },
  },
  Media: {
    scoreMal: async (media: AnimeViewAnime): Promise<number | null> => {
      if (isNil(media) || isNil(media.idMal)) return null

      try {
        return fetchRating(media.idMal)
      } catch (err) {
        return null
      }
    },
  },
  Episode: {
    isWatched: (
      episode: EpisodeListEpisodes,
      _: never,
      { cache }: { cache: RealProxy },
    ) => getIsWatched(cache, episode.animeId, episode.episodeNumber),
  },
  Mutation: {
    CacheEpisodes(
      _: any,
      { id, provider, episodes, nextEpisodeAiringAt }: CacheEpisodesVariables,
      { cache }: { cache: RealProxy },
    ) {
      try {
        cacheEpisodes(
          cache,
          provider,
          {
            [id]: episodes,
          },
          nextEpisodeAiringAt,
        )
      } catch (err) {
        return false
      }

      return true
    },
  },
}
