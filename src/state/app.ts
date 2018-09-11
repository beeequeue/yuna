import { ActionContext } from 'vuex'
import { getStoreAccessors } from 'vuex-typescript'
import { activeWindow } from 'electron-util'

import { RootState } from '@/state/store'
import { router } from '@/router'
import { Episode } from '@/types'

export interface AppState {
  episode: Episode | null
  isFullscreen: boolean
}

type AppContext = ActionContext<AppState, RootState>

const initialState: AppState = {
  episode: null,
  isFullscreen: false,
}

export const app = {
  state: { ...initialState },

  getters: {
    getCurrentEpisode(state: AppState) {
      return state.episode
    },

    getIsFullscreen(state: AppState) {
      return state.isFullscreen
    },
  },

  mutations: {
    setCurrentEpisode(state: AppState, episode: Episode) {
      state.episode = episode
    },

    setFullscreen(state: AppState, b: boolean) {
      state.isFullscreen = b
    },
  },

  actions: {
    toggleFullscreen(context: AppContext) {
      const browserWindow = activeWindow()
      const isFullscreen = context.state.isFullscreen

      if (!isFullscreen) {
        router.push('/player-full')
      } else {
        router.back()
      }

      browserWindow.setFullScreen(!isFullscreen)
      setFullscreen(context, !isFullscreen)
    },
  },
}

const { read, commit, dispatch } = getStoreAccessors<AppState, RootState>('')

export const getCurrentEpisode = read(app.getters.getCurrentEpisode)
export const getIsFullscreen = read(app.getters.getIsFullscreen)

export const setCurrentEpisode = commit(app.mutations.setCurrentEpisode)
const setFullscreen = commit(app.mutations.setFullscreen)

export const toggleFullscreen = dispatch(app.actions.toggleFullscreen)
