import { ActionContext } from 'vuex'
import { getStoreAccessors } from 'vuex-typescript'
import { RootState } from '@/state/store'
import { fetchQueue } from '@/lib/crunchyroll'
import { Anime, Episode } from '@/types'

export enum AnimeState {
  PLANNING,
  WATCHING,
  REWATCHING,
  COMPLETED,
}

export interface QueueItem {
  episode: Episode
  series: Anime
}

export interface UserState {
  queue: QueueItem[]
}

type UserContext = ActionContext<UserState, RootState>

const initialState: UserState = {
  queue: [],
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
    },
  },

  actions: {
    async updateQueue(context: UserContext) {
      setQueue(context, await fetchQueue(context.rootState.auth.sessionId))
    },
  },
}

const { read, commit, dispatch } = getStoreAccessors<UserState, RootState>('')

export const getQueue = read(user.getters.getQueue)

export const setQueue = commit(user.mutations.setQueue)

export const updateQueue = dispatch(user.actions.updateQueue)
