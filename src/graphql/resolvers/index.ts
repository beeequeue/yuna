import { isWatchedResolver } from './is-watched'
import { scoreMalResolver } from './score-mal'
import { CacheEpisodesResolver } from './cache-episodes'
import { EpisodesResolver } from './episodes'
import {
  AddToList,
  DeleteFromList,
  GetListEntry,
  StartRewatching,
  UpdateProgress,
  UpdateStatus,
} from './list-entry'

export const resolvers = {
  Query: {
    Episodes: EpisodesResolver,
  },
  Media: {
    scoreMal: scoreMalResolver,
    listEntry: GetListEntry,
  },
  Episode: {
    isWatched: isWatchedResolver,
  },
  Mutation: {
    CacheEpisodes: CacheEpisodesResolver,
    AddToList,
    DeleteFromList,
    UpdateStatus,
    UpdateProgress,
    StartRewatching,
  },
}
