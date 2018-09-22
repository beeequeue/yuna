import { ActionContext } from 'vuex'
import { getStoreAccessors } from 'vuex-typescript'
import {
  NotificationFunctionOptions,
  NotificationTypes,
} from 'vue-notifications'
import { propEq, reject } from 'rambda'
import { activeWindow } from 'electron-util'

import { RootState } from '@/state/store'
import { router } from '@/router'
import { Episode } from '@/types'

const generateId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz1234567890'
  let id = ''

  for (let i = 0; i < 8; i++) {
    id += chars[Math.round(Math.random() * chars.length - 1)]
  }

  return id
}

interface Toast {
  id: string
  title: string
  message: string
  type: NotificationTypes
}

type AddToastMutationOptions = NotificationFunctionOptions<
  NotificationTypes
> & { id: string }

export interface AppState {
  isUpdateAvailable: boolean
  toasts: Toast[]
  episode: Episode | null
  isFullscreen: boolean
}

type AppContext = ActionContext<AppState, RootState>

const initialState: AppState = {
  isUpdateAvailable: false,
  toasts: [],
  episode: null,
  isFullscreen: false,
}

export const app = {
  state: { ...initialState },

  getters: {
    getIsUpdateAvailable(state: AppState) {
      return state.isUpdateAvailable
    },

    getToasts(state: AppState) {
      return state.toasts
    },

    getCurrentEpisode(state: AppState) {
      return state.episode
    },

    getIsFullscreen(state: AppState) {
      return state.isFullscreen
    },
  },

  mutations: {
    setIsUpdateAvailable(state: AppState, available: boolean) {
      state.isUpdateAvailable = available
    },

    addToast(state: AppState, payload: AddToastMutationOptions) {
      state.toasts = [
        ...state.toasts,
        {
          id: payload.id,
          title: payload.title,
          message: payload.message,
          type: payload.type,
        },
      ]
    },

    removeToast(state: AppState, id: string) {
      state.toasts = reject(propEq('id', id), state.toasts)
    },

    setCurrentEpisode(state: AppState, episode: Episode) {
      state.episode = episode
    },

    setFullscreen(state: AppState, b: boolean) {
      state.isFullscreen = b
    },
  },

  actions: {
    notifyDownloadDone() {
      // tslint:disable-next-line:no-unused-expression
      new Notification('New version downloaded, restart to start using it!')
    },

    sendToast(
      context: AppContext,
      options: NotificationFunctionOptions<NotificationTypes>,
    ) {
      const id = generateId()
      addToast(context, { id, ...options })

      if (options.consoleMessage && (console as any)[options.type]) {
        ;(console as any)[options.type](options.consoleMessage)
      }

      setTimeout(() => {
        removeToast(context, id)
      }, options.timeout)
    },

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

export const getIsUpdateAvailable = read(app.getters.getIsUpdateAvailable)
export const getToasts = read(app.getters.getToasts)
export const getCurrentEpisode = read(app.getters.getCurrentEpisode)
export const getIsFullscreen = read(app.getters.getIsFullscreen)

export const setIsUpdateAvailable = commit(app.mutations.setIsUpdateAvailable)
const addToast = commit(app.mutations.addToast)
export const removeToast = commit(app.mutations.removeToast)
export const setCurrentEpisode = commit(app.mutations.setCurrentEpisode)
const setFullscreen = commit(app.mutations.setFullscreen)

export const toggleFullscreen = dispatch(app.actions.toggleFullscreen)
export const sendToast = dispatch(app.actions.sendToast)
export const notifyDownloadDone = dispatch(app.actions.notifyDownloadDone)
