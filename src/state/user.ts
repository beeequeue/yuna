import { ActionContext } from 'vuex'
import { getStoreAccessors } from 'vuex-typescript'
import { v4 as uuid } from 'uuid'

import {
  ListEntry,
  Media,
  MediaExternalLink,
  MediaListStatus,
  Provider,
} from '@/graphql/generated/types'
import { RootState } from '@/state/store'
import { getDefaultProvider } from '@/state/auth'
import { QueueItem, userStore } from '@/lib/user'
import { isNotNil, propEq } from '@/utils'
import { setUser } from '@sentry/browser'

const isInQueue = (state: UserState, id: number) =>
  isNotNil(state.queue.find(propEq('id', id)))

const isCurrentlyWatching = (anime: AddToQueueOptions) =>
  [MediaListStatus.Current, MediaListStatus.Repeating].includes(
    anime.listEntry?.status!,
  )

type SetProviderOptions = {
  id: number
  provider: Provider
}

type AddToQueueOptions = Pick<Media, 'id'> & {
  externalLinks: Array<null | Pick<MediaExternalLink, 'site' | 'url'>> | null
  listEntry: Pick<ListEntry, 'status'> | null
}

export type UserState = {
  deviceUuid: string
  queue: QueueItem[]
}

const initialState: UserState = {
  deviceUuid: userStore.get('deviceUuid', uuid()),
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

userStore.set(initialState)

setUser({
  id: initialState.deviceUuid,
})

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
      _addToQueue(context, {
        id: anime.id,
        open: isCurrentlyWatching(anime),
        provider: getDefaultProvider(context.rootState.auth, anime),
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
