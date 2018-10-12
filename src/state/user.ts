import { ActionContext } from 'vuex'
import { getStoreAccessors } from 'vuex-typescript'
import { propEq } from 'rambda'

import { RootState } from '@/state/store'
import { userStore } from '@/lib/user'

export interface UserState {
  queue: number[]
}

type UserContext = ActionContext<UserState, RootState>

const initialState: UserState = {
  queue: userStore.get('queue', []),
}

export const user = {
  state: { ...initialState },

  getters: {
    getQueue(state: UserState) {
      return state.queue
    },
  },

  mutations: {
    setQueue(state: UserState, queue: number[]) {
      state.queue = queue

      userStore.set('queue', queue)
    },

    addToQueue(state: UserState, id: number) {
      state.queue = [...state.queue, id]

      userStore.set('queue', state.queue)
    },

    removeFromQueueByIndex(state: UserState, index: number) {
      state.queue.splice(index, 1)

      userStore.set('queue', state.queue)
    },

    removeFromQueueById(state: UserState, id: number) {
      state.queue.splice(state.queue.findIndex(propEq('id', id)), 1)

      userStore.set('queue', state.queue)
    },
  },

  actions: {
    async updateQueue(_context: UserContext) {
      // noop
    },
  },
}

const { read, commit, dispatch } = getStoreAccessors<UserState, RootState>('')

export const getQueue = read(user.getters.getQueue)

export const setQueue = commit(user.mutations.setQueue)
export const addToQueue = commit(user.mutations.addToQueue)
export const removeFromQueueByIndex = commit(
  user.mutations.removeFromQueueByIndex,
)
export const removeFromQueueById = commit(user.mutations.removeFromQueueById)

export const updateQueue = dispatch(user.actions.updateQueue)
