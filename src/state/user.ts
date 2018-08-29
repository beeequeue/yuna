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
  episode: Episode | null
  queue: QueueItem[]
}

type UserContext = ActionContext<UserState, RootState>

const initialState: UserState = {
  episode: null,
  queue: [],
}

export const user = {
  state: { ...initialState },

  getters: {
    getCurrentEpisode(state: UserState) {
      return state.episode
    },

    getQueue(state: UserState) {
      return state.queue
    },
  },

  mutations: {
    setCurrentEpisode(state: UserState, episode: Episode) {
      state.episode = episode
    },

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

export const getCurrentEpisode = read(user.getters.getCurrentEpisode)
export const getQueue = read(user.getters.getQueue)

export const setCurrentEpisode = commit(user.mutations.setCurrentEpisode)
export const setQueue = commit(user.mutations.setQueue)

export const updateQueue = dispatch(user.actions.updateQueue)
