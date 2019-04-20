import gql from 'graphql-tag'

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
import { getEpisodeRelations } from '@/lib/relations'
import { EpisodeCache } from '@/lib/episode-cache'
import { AniDB } from '@/lib/anidb'
import { Hidive } from '@/lib/hidive'
import { isNil, propEq } from '@/utils'

import { isWatched } from './is-watched'
import { cacheEpisodes, cacheRelations } from '@/utils/cache'

interface EpisodeVariables {
  id: number
  provider: Provider
}

interface CachedAnime {
  idMal: number | null
  nextAiringEpisode: null | {
    airingAt: number
  }
  externalLinks: Array<{ site: string; url: string }>
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
              externalLinks {
                site
                url
              }
            }
          `,
        })

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

          cacheRelations(cache, relations)

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

          cacheRelations(cache, relations)

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
    isWatched,
  },
  Mutation: {
    CacheEpisodes(
      _: any,
      { episodes }: CacheEpisodesVariables,
      { cache }: { cache: RealProxy },
    ) {
      try {
        cacheEpisodes(cache, episodes)
      } catch (err) {
        return false
      }

      return true
    },
  },
}
