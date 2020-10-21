import { ApolloCache } from '@apollo/client/cache'

import { CacheEpisodesVariables } from '@/graphql/generated/types'
import { cacheEpisodes } from '@/utils/cache'

export const CacheEpisodesResolver = (
  _: any,
  { episodes }: CacheEpisodesVariables,
  { cache }: { cache: ApolloCache<unknown> },
) => {
  try {
    cacheEpisodes(cache, episodes)
  } catch (err) {
    return false
  }

  return true
}
