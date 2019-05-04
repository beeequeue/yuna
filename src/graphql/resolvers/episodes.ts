import { oc } from 'ts-optchain'

import { EpisodeListEpisodes, Provider } from '@/graphql/types'

import { fetchEpisodesOfSeries } from '@/lib/myanimelist'
import { getEpisodeRelations } from '@/lib/relations'
import { EpisodeCache } from '@/lib/episode-cache'
import { AniDB } from '@/lib/anidb'
import { Hidive } from '@/lib/hidive'
import { Simkl } from '@/lib/simkl'
import { isNil, propEq } from '@/utils'
import {
  cacheRelations,
  getCachedAnimeIdMal,
  getCachedExternalLinks,
  getSoftCachedEpisodes,
} from '@/utils/cache'

const episodesExist = (
  episodes: EpisodeListEpisodes[] | null | undefined,
): episodes is EpisodeListEpisodes[] => !isNil(episodes) && episodes.length >= 1

const getEpisodesFromCache = (
  cache: RealProxy,
  id: number,
  provider: Provider,
) => {
  let episodes: EpisodeListEpisodes[] | null

  episodes = getSoftCachedEpisodes(cache, id, provider)

  if (!episodesExist(episodes)) {
    const hardCachedEpisodes =
      oc(EpisodeCache.get(id, provider)).episodes() || null

    if (episodesExist(hardCachedEpisodes)) {
      episodes = hardCachedEpisodes
    }
  }

  return episodes
}

const fetchEpisodesFromCrunchyroll = async (
  cache: RealProxy,
  id: number,
  provider: Provider,
) => {
  const idMal = getCachedAnimeIdMal(cache, id)
  let unconfirmedEpisodes

  // Try MAL's episode listings
  if (!isNil(idMal)) {
    try {
      unconfirmedEpisodes = await fetchEpisodesOfSeries(id, idMal)
    } catch (err) {
      throw new Error(err)
    }
  }

  // Try to get AniDB ID, and episodes from there
  if (!episodesExist(unconfirmedEpisodes) && idMal) {
    try {
      let anidbId = await Simkl.getAnidbID(idMal)

      if (isNil(anidbId)) {
        anidbId = await AniDB.getIdFromAnilistId(id)
      }

      if (!isNil(anidbId)) {
        unconfirmedEpisodes = await AniDB.getEpisodesFromId(id, Number(anidbId))
      }
    } catch (err) {
      throw new Error(err)
    }
  }

  if (unconfirmedEpisodes == null) {
    return null
  }

  const episodesWithCorrectProvider = unconfirmedEpisodes.map(ep => ({
    ...ep,
    provider: provider,
  }))

  const relations = getEpisodeRelations(id, episodesWithCorrectProvider)

  cacheRelations(cache, relations)

  return relations[id]
}

const fetchEpisodesFromHidive = async (cache: RealProxy, id: number) => {
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

  return relations[id]
}

interface EpisodeVariables {
  id: number
  provider: Provider
}

export const EpisodesResolver = async (
  _: any,
  { id, provider }: EpisodeVariables,
  { cache }: { cache: RealProxy },
): Promise<EpisodeListEpisodes[] | null> => {
  const nextEpisodeAiringAt = EpisodeCache.getNextEpisodeAiringAt(id, provider)
  const isStale =
    !isNil(nextEpisodeAiringAt) && Date.now() >= nextEpisodeAiringAt

  let episodes: EpisodeListEpisodes[] | null = null

  if (!isStale) {
    episodes = getEpisodesFromCache(cache, id, provider)
  }

  // Don't check providers if episodes == [] as that means they don't have it. null means we don't know.
  if (isStale || isNil(episodes)) {
    if ([Provider.Crunchyroll, Provider.CrunchyrollManual].includes(provider)) {
      episodes = await fetchEpisodesFromCrunchyroll(cache, id, provider)
    } else if (provider === Provider.Hidive) {
      episodes = await fetchEpisodesFromHidive(cache, id)
    }
  }

  return episodes
}
