import { EpisodeListEpisodes } from '@/graphql/types'
import { getIsWatched } from '@/utils/cache'

export const isWatchedResolver = (
  episode: EpisodeListEpisodes,
  _: null,
  { cache }: { cache: RealProxy },
) => getIsWatched(cache, episode.animeId, episode.episodeNumber)
