import {
  AnimeViewAnime,
  CacheEpisodesVariables,
  EpisodeListEpisodes,
  Provider,
} from '@/graphql/types'

import { fetchEpisodesOfSeries, fetchRating } from '@/lib/myanimelist'
import { getEpisodeRelations } from '@/lib/relations'
import { EpisodeCache } from '@/lib/episode-cache'
import { AniDB } from '@/lib/anidb'
import { Hidive } from '@/lib/hidive'
import { isNil, propEq } from '@/utils'
import {
  cacheEpisodes,
  cacheRelations,
  getCachedExternalLinks,
  getCachedAnimeIdMal,
  getSoftCachedEpisodes,
} from '@/utils/cache'

import { isWatched } from './is-watched'
import { oc } from 'ts-optchain'

interface EpisodeVariables {
  id: number
  provider: Provider
}

const episodesExist = (
  episodes: EpisodeListEpisodes[] | null,
): episodes is EpisodeListEpisodes[] => !isNil(episodes) && episodes.length >= 1

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

      if (!isStale) {
        episodes = getSoftCachedEpisodes(cache, id, provider)

        if (!episodesExist(episodes)) {
          const hardCachedEpisodes =
            oc(EpisodeCache.get(id, provider)).episodes() || null

          if (!episodesExist(hardCachedEpisodes)) {
            episodes = hardCachedEpisodes
          }
        }
      }

      // Don't check providers if episodes == [] as that means they don't have it. null means we don't know.
      if (isStale || isNil(episodes)) {
        if (
          [Provider.Crunchyroll, Provider.CrunchyrollManual].includes(provider)
        ) {
          const idMal = getCachedAnimeIdMal(cache, id)
          let unconfirmedEpisodes

          if (!isNil(idMal)) {
            try {
              unconfirmedEpisodes = await fetchEpisodesOfSeries(id, idMal)
            } catch (err) {
              throw new Error(err)
            }
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
          const externalLinks = getCachedExternalLinks(cache, id) || []
          const hidiveLink = externalLinks.find(propEq('site', 'Hidive'))

          if (isNil(hidiveLink)) {
            throw new Error('Could not find link to Hidive.')
          }

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
