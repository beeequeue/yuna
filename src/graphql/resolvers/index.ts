import { isWatchedResolver } from './is-watched'
import { scoreMalResolver } from './score-mal'
import { CacheEpisodesResolver } from './cache-episodes'
import { EpisodesResolver } from './episodes'
import { AddToList } from './list-entry'

export const resolvers = {
  Query: {
    Episodes: EpisodesResolver,
  },
  Media: {
    scoreMal: scoreMalResolver,
  },
  Episode: {
    isWatched: isWatchedResolver,
  },
  Mutation: {
    CacheEpisodes: CacheEpisodesResolver,
    AddToList: AddToList
  },
}
