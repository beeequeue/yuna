import type { Resolvers } from 'apollo-client'
import type { Store } from 'vuex'

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

export const createResolvers = (store: Store<any>): Resolvers => ({
  Media: {
    scoreMal: scoreMalResolver,
    ...simklResolvers.Media,
    listEntry: GetListEntry(store),
  },
  Episode: {
    isWatched: isWatchedResolver,
  },
  ListEntry: {
    media: GetMedia,
  },
  Query: {
    Episodes: EpisodesResolver,
    ListEntry: GetListEntry(store),
    ListEntries: GetListEntries(store),
  },
  Mutation: {
    CacheEpisodes: CacheEpisodesResolver,
    AddToList: AddToList(store),
    DeleteFromList: DeleteFromList(store),
    UpdateStatus: UpdateStatus(store),
    UpdateProgress: UpdateProgress(store),
    UpdateScore: UpdateScore(store),
    StartRewatching: StartRewatching(store),
    EditListEntry: EditListEntry(store),
  },
})
