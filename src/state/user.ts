import { getStoreAccessors } from 'vuex-typescript'
import { isNil, propEq } from 'rambdax'

import { Provider } from '@/graphql/types'
import { RootState } from '@/state/store'
import { QueueItem, userStore } from '@/lib/user'

const isInQueue = (state: UserState, id: number) =>
  !isNil(state.queue.find(propEq('id', id)))

interface SetProviderOptions {
  id: number
  provider: Provider
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

    addToQueue(state: UserState, id: number) {
      if (isInQueue(state, id)) return

      state.queue = [
        ...state.queue,
        { id, open: false, provider: Provider.Crunchyroll },
      ]

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

  actions: {},
}

const { read, commit } = getStoreAccessors<UserState, RootState>('user')

export const getQueue = read(user.getters.getQueue)
export const getIsInQueue = read(user.getters.getIsInQueue)

export const setQueue = commit(user.mutations.setQueue)
export const addToQueue = commit(user.mutations.addToQueue)
export const removeFromQueueByIndex = commit(
  user.mutations.removeFromQueueByIndex,
)
export const removeFromQueueById = commit(user.mutations.removeFromQueueById)
export const toggleQueueItemOpen = commit(user.mutations.toggleQueueItemOpen)
export const setQueueItemProvider = commit(user.mutations.setQueueItemProvider)
