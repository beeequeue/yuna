import { getStoreAccessors } from 'vuex-typescript'
import { isNil, path, pathOr, propEq } from 'rambdax'

import { MediaListStatus, Provider } from '@/graphql/types'
import { RootState } from '@/state/store'
import { QueueItem, userStore } from '@/lib/user'
import { StreamingSource } from '@/types'
import { getStreamingSources, stripFalsy } from '@/utils'
import { ActionContext } from 'vuex'
import { getIsConnectedTo } from '@/state/auth'

const isInQueue = (state: UserState, id: number) =>
  !isNil(state.queue.find(propEq('id', id)))

const addIfExistsAndIsConnected = (
  store: UserContext,
  provider: Provider,
  source: StreamingSource,
  sources: string[],
): Provider => {
  // Since enums are lowercase
  const lowercaseSources = sources.map(str => str.toLowerCase())
  const isConnectedToProvider: boolean = (getIsConnectedTo as any)(store)[
    provider.toLowerCase()
  ]

  return isConnectedToProvider && lowercaseSources.includes(source)
    ? provider
    : (false as any)
}

const isCurrentlyWatching = (anime: AddToQueueOptions) =>
  [MediaListStatus.Current, MediaListStatus.Repeating].includes(
    pathOr(null, 'mediaListEntry.status', anime),
  )

interface SetProviderOptions {
  id: number
  provider: Provider
}

interface AddToQueueOptions {
  id: number
  externalLinks: Array<{ site: string; url: string }>
  mediaListEntry: null | {
    status: MediaListStatus
  }
}

export interface UserState {
  queue: QueueItem[]
}

const initialState: UserState = {
  queue: userStore.get('queue', []),
}

// Migration from number[]
if (
  initialState.queue.length > 0 &&
  typeof initialState.queue[0] === 'number'
) {
  initialState.queue = initialState.queue.map(id => ({
    id: id as any,
    open: true,
    provider: Provider.Crunchyroll,
  }))
}

type UserContext = ActionContext<UserState, RootState>

export const user = {
  namespaced: true,

  state: { ...initialState },

  getters: {
    getQueue(state: UserState) {
      return state.queue
    },

    getIsInQueue(state: UserState) {
      return (id: number) => isInQueue(state, id)
    },
  },

  mutations: {
    setQueue(state: UserState, queue: QueueItem[]) {
      state.queue = queue

      userStore.set('queue', queue)
    },

    addItemToQueue(state: UserState, item: QueueItem) {
      if (isInQueue(state, item.id)) return

      state.queue = [...state.queue, item]

      userStore.set('queue', state.queue)
    },

    removeFromQueueByIndex(state: UserState, index: number) {
      state.queue.splice(index, 1)

      userStore.set('queue', state.queue)
    },

    removeFromQueueById(state: UserState, id: number) {
      if (!isInQueue(state, id)) return

      state.queue.splice(state.queue.findIndex(propEq('id', id)), 1)

      userStore.set('queue', state.queue)
    },

    toggleQueueItemOpen(state: UserState, id: number) {
      if (!isInQueue(state, id)) return

      const index = state.queue.findIndex(propEq('id', id))
      state.queue[index].open = !state.queue[index].open

      userStore.set('queue', state.queue)
    },

    setQueueItemProvider(state: UserState, options: SetProviderOptions) {
      if (!isInQueue(state, options.id)) return

      const index = state.queue.findIndex(propEq('id', options.id))
      state.queue[index].provider = options.provider

      userStore.set('queue', state.queue)
    },
  },

  actions: {
    addToQueue(context: UserContext, anime: AddToQueueOptions) {
      const sources = getStreamingSources(anime.externalLinks).map<string>(
        path('site'),
      )

      const supportedProviders = [
        addIfExistsAndIsConnected(
          context,
          Provider.Crunchyroll,
          StreamingSource.Crunchyroll,
          sources,
        ),
        addIfExistsAndIsConnected(
          context,
          Provider.Hidive,
          StreamingSource.Hidive,
          sources,
        ),
      ]
      const provider = stripFalsy(supportedProviders)[0] || Provider.Crunchyroll

      _addToQueue(context, {
        id: anime.id,
        open: isCurrentlyWatching(anime),
        provider: provider,
      })
    },
  },
}

const { read, commit, dispatch } = getStoreAccessors<UserState, RootState>(
  'user',
)

export const getQueue = read(user.getters.getQueue)
export const getIsInQueue = read(user.getters.getIsInQueue)

export const setQueue = commit(user.mutations.setQueue)
const _addToQueue = commit(user.mutations.addItemToQueue)
export const removeFromQueueByIndex = commit(
  user.mutations.removeFromQueueByIndex,
)
export const removeFromQueueById = commit(user.mutations.removeFromQueueById)
export const toggleQueueItemOpen = commit(user.mutations.toggleQueueItemOpen)
export const setQueueItemProvider = commit(user.mutations.setQueueItemProvider)

export const addToQueue = dispatch(user.actions.addToQueue)
