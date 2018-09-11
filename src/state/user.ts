import { ActionContext } from 'vuex'
import { getStoreAccessors } from 'vuex-typescript'

import { RootState } from '@/state/store'
import { fetchQueue } from '@/lib/crunchyroll'
import { QueueItem, userStore } from '@/lib/user'

export interface UserState {
  queue: QueueItem[]
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
    setQueue(state: UserState, queue: QueueItem[]) {
      state.queue = queue

      userStore.set('queue', queue)
    },
  },

  actions: {
    async updateQueue(context: UserContext) {
      setQueue(context, await fetchQueue())
    },
  },
}

const { read, commit, dispatch } = getStoreAccessors<UserState, RootState>('')

export const getQueue = read(user.getters.getQueue)

export const setQueue = commit(user.mutations.setQueue)

export const updateQueue = dispatch(user.actions.updateQueue)
