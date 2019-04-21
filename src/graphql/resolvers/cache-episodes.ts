import { CacheEpisodesVariables } from '@/graphql/types'
import { cacheEpisodes } from '@/utils/cache'

export const CacheEpisodesResolver = (
  _: any,
  { episodes }: CacheEpisodesVariables,
  { cache }: { cache: RealProxy },
) => {
  try {
    cacheEpisodes(cache, episodes)
  } catch (err) {
    return false
  }

  return true
}
