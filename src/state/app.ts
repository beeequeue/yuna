import { activeWindow } from 'electron-util'
import { merge, propEq, reject } from 'rambda'
import {
  NotificationFunctionOptions,
  NotificationTypes,
} from 'vue-notifications'
import { ActionContext } from 'vuex'
import { getStoreAccessors } from 'vuex-typescript'

import { MediaListStatus } from '@/graphql-types'
import { router } from '@/router'
import { RootState } from '@/state/store'
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

type ToastOptions = NotificationFunctionOptions<NotificationTypes>

type AddToastMutationOptions = NotificationFunctionOptions<
  NotificationTypes
> & { id: string }

export interface ListEntry {
  id: number
  status: MediaListStatus
  progress: number
}

interface PlayerOptions {
  id: number
  animeName: string
  listEntry?: ListEntry | null
  episodes: Episode[]
  current: number
}

export interface AppState {
  isUpdateAvailable: boolean
  toasts: Toast[]
  isFullscreen: boolean
  player: PlayerOptions | null
}

type AppContext = ActionContext<AppState, RootState>

const initialState: AppState = {
  isUpdateAvailable: false,
  toasts: [],
  player: null,
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

    getPlayerData(state: AppState) {
      return state.player
    },

    getPlaylistAnimeId(state: AppState) {
      if (!state.player) return null

      return state.player.id
    },

    getPlaylistEntry(state: AppState) {
      if (!state.player) return null

      return state.player.listEntry
    },

    getPlaylist(state: AppState) {
      if (!state.player) return null

      return state.player.episodes
    },

    getCurrentEpisode(state: AppState) {
      if (!state.player) return null

      return state.player.episodes[state.player.current]
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

    setPlaylist(state: AppState, options: PlayerOptions) {
      state.player = options
    },

    setCurrentEpisode(state: AppState, index: number) {
      if (!state.player) return

      state.player.current = index
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

    sendToast(context: AppContext, options: ToastOptions) {
      const realOptions = merge(
        {
          timeout: 4000,
        },
        options,
      )

      const id = generateId()
      addToast(context, { id, ...realOptions })

      if (realOptions.consoleMessage && (console as any)[realOptions.type]) {
        ;(console as any)[realOptions.type](realOptions.consoleMessage)
      }

      setTimeout(() => {
        removeToast(context, id)
      }, realOptions.timeout)
    },

    sendErrorToast(context: AppContext, error: string) {
      sendToast(context, {
        type: 'error',
        title: 'An error occurred!',
        message: error,
      })
    },

    sendNotImplementedToast(context: AppContext) {
      sendToast(context, {
        type: 'error',
        title: 'Not implemented',
        message: 'This has not been added yet!',
      })
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
export const getPlayerData = read(app.getters.getPlayerData)
export const getPlaylistAnimeId = read(app.getters.getPlaylistAnimeId)
export const getPlaylistEntry = read(app.getters.getPlaylistEntry)
export const getPlaylist = read(app.getters.getPlaylist)
export const getCurrentEpisode = read(app.getters.getCurrentEpisode)
export const getIsFullscreen = read(app.getters.getIsFullscreen)

export const setIsUpdateAvailable = commit(app.mutations.setIsUpdateAvailable)
const addToast = commit(app.mutations.addToast)
export const removeToast = commit(app.mutations.removeToast)
export const setPlaylist = commit(app.mutations.setPlaylist)
export const setCurrentEpisode = commit(app.mutations.setCurrentEpisode)
const setFullscreen = commit(app.mutations.setFullscreen)

export const toggleFullscreen = dispatch(app.actions.toggleFullscreen)
export const sendToast = dispatch(app.actions.sendToast)
export const sendErrorToast = dispatch(app.actions.sendErrorToast)
export const sendNotImplementedToast = dispatch(
  app.actions.sendNotImplementedToast,
)
export const notifyDownloadDone = dispatch(app.actions.notifyDownloadDone)
