import { ApolloCache } from "@apollo/client/cache"

import { EpisodeListEpisodes } from "@/graphql/generated/types"
import { getIsWatched } from "@/utils/cache"

export const isWatchedResolver = (
  episode: EpisodeListEpisodes,
  _: null,
  { cache }: { cache: ApolloCache<unknown> },
) => getIsWatched(cache, episode.animeId, episode.episodeNumber)
