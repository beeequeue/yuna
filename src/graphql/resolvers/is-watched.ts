import { Episode } from '@/graphql/types'
import { getIsWatched } from '@/utils/cache'

export const isWatchedResolver = (
  episode: Episode,
  _: never,
  { cache }: { cache: RealProxy },
) => getIsWatched(cache, episode.animeId, episode.episodeNumber)
