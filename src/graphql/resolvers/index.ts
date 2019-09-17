import { isWatchedResolver } from './is-watched'
import { scoreMalResolver } from './score-mal'
import { simklResolvers } from './simkl-media'
import { CacheEpisodesResolver } from './cache-episodes'
import { EpisodesResolver } from './episodes'
import {
  AddToList,
  DeleteFromList,
  EditListEntry,
  GetListEntries,
  GetListEntry,
  GetMedia,
  StartRewatching,
  UpdateProgress,
  UpdateScore,
  UpdateStatus,
} from './list-entry'

export const resolvers = {
  Media: {
    scoreMal: scoreMalResolver,
    ...simklResolvers.Media,
    listEntry: GetListEntry,
  },
  Episode: {
    isWatched: isWatchedResolver,
  },
  ListEntry: {
    media: GetMedia,
  },
  Query: {
    Episodes: EpisodesResolver,
    ListEntry: GetListEntry,
    ListEntries: GetListEntries,
  },
  Mutation: {
    CacheEpisodes: CacheEpisodesResolver,
    AddToList,
    DeleteFromList,
    UpdateStatus,
    UpdateProgress,
    UpdateScore,
    StartRewatching,
    EditListEntry,
  },
}
