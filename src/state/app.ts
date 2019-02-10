import { activeWindow } from 'electron-util'
import { merge, propEq, reject, change, isNil } from 'rambdax'
import {
  NotificationFunctionOptions,
  NotificationTypes,
} from 'vue-notifications'
import { ActionContext } from 'vuex'
import { getStoreAccessors } from 'vuex-typescript'

import { MediaListStatus, Provider } from '@/graphql/types'
import { router } from '@/router'
import { RootState } from '@/state/store'
import { generateId } from '@/utils'

export interface Toast {
  id: string
  title: string
  message: string
  type: NotificationTypes
  click?: (...a: any[]) => any
}

type ToastOptions = NotificationFunctionOptions<NotificationTypes> & {
  click?: (...a: any[]) => any
}

type AddToastMutationOptions = NotificationFunctionOptions<
  NotificationTypes
> & { id: string; click?: (...a: any[]) => any }

export interface ListEntry {
  id: number
  status: MediaListStatus
  progress: number
}

export interface Sequel {
  id: number
  title: string
  bannerImage: string
}

export interface PlayerData {
  id: number
  index: number
  provider: Provider
}

interface ModalBase {
  visible: boolean
}

export interface EditModalAnime {
  id: number
  title: {
    userPreferred: string
  }
  bannerImage: string
  isFavourite: boolean
  mediaListEntry: {
    id: number
    progress: number
    status: MediaListStatus
    score: number
    repeat: number
  }
}

export interface AppState {
  isUpdateAvailable: boolean
  toasts: Toast[]
  isFullscreen: boolean
  player: PlayerData | null
  modals: {
    about: ModalBase
    edit: ModalBase & {
      anime: EditModalAnime | null
    }
  }
}

type AppContext = ActionContext<AppState, RootState>

const initialState: AppState = {
  isUpdateAvailable: false,
  toasts: [],
  isFullscreen: false,
  player: null,
  modals: {
    about: {
      visible: false,
    },
    edit: {
      visible: false,
      anime: null,
    },
  },
}

export const app = {
  namespaced: true,

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

    getModalStates(state: AppState) {
      return Object.keys(state.modals).reduce(
        (map, key) => {
          map[key] = (state.modals as any)[key].visible
          return map
        },
        {} as any,
      )
    },

    getEditingAnime(state: AppState) {
      return state.modals.edit.anime
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
          click: payload.click,
        },
      ]
    },

    removeToast(state: AppState, id: string) {
      state.toasts = reject(propEq('id', id), state.toasts)
    },

    setPlaylist(state: AppState, options: PlayerData | null) {
      state.player = options
    },

    setCurrentEpisode(state: AppState, index: number) {
      if (!state.player) return

      state.player.index = index
    },

    toggleModal(state: AppState, modal: keyof AppState['modals']) {
      state.modals[modal].visible = !state.modals[modal].visible
    },

    closeAllModals(state: AppState) {
      Object.keys(state.modals).forEach(modal => {
        ;(state.modals as any)[modal].visible = false
      })
    },

    setEditingAnime(state: AppState, anime: EditModalAnime) {
      state.modals.edit.anime = anime
    },

    setEditingAnimeValue(
      state: AppState,
      payload: {
        key: keyof EditModalAnime
        value: any
      },
    ) {
      if (!state.modals.edit.anime) return

      state.modals.edit.anime = change(
        state.modals.edit.anime,
        payload.key,
        payload.value,
      ) as any
    },

    setFullscreen(state: AppState, b: boolean) {
      const browserWindow = activeWindow()

      state.isFullscreen = b
      browserWindow.setFullScreen(b)
    },
  },

  actions: {
    notifyDownloadDone() {
      // eslint-disable-next-line no-unused-expression
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
      const isFullscreen = context.state.isFullscreen

      if (!isFullscreen) {
        router.push('/player-full')
      } else {
        router.back()
      }

      setFullscreen(context, !isFullscreen)
    },

    initEditModal(context: AppContext, anime: EditModalAnime) {
      setEditingAnime(context, anime)
      toggleModal(context, 'edit')
    },

    setCurrentEpisode(
      context: AppContext,
      options:
        | number
        | { id: number; index: number; provider: Provider }
        | null,
    ) {
      if (isNil(options)) {
        return setPlaylist(context, null)
      }

      if (typeof options === 'number') {
        _setCurrentEpisode(context, options)
      } else {
        setPlaylist(context, {
          id: options.id,
          index: options.index,
          provider: options.provider,
        })
      }
    },
  },
}

const { read, commit, dispatch } = getStoreAccessors<AppState, RootState>('app')

export const getIsUpdateAvailable = read(app.getters.getIsUpdateAvailable)
export const getToasts = read(app.getters.getToasts)
export const getPlayerData = read(app.getters.getPlayerData)
export const getPlaylistAnimeId = read(app.getters.getPlaylistAnimeId)
export const getModalStates = read(app.getters.getModalStates)
export const getEditingAnime = read(app.getters.getEditingAnime)
export const getIsFullscreen = read(app.getters.getIsFullscreen)

export const setIsUpdateAvailable = commit(app.mutations.setIsUpdateAvailable)
const setEditingAnime = commit(app.mutations.setEditingAnime)
export const setEditingAnimeValue = commit(app.mutations.setEditingAnimeValue)
export const removeToast = commit(app.mutations.removeToast)
const setPlaylist = commit(app.mutations.setPlaylist)
const _setCurrentEpisode = commit(app.mutations.setCurrentEpisode)
export const toggleModal = commit(app.mutations.toggleModal)
const addToast = commit(app.mutations.addToast)
export const closeAllModals = commit(app.mutations.closeAllModals)
export const setFullscreen = commit(app.mutations.setFullscreen)

export const toggleFullscreen = dispatch(app.actions.toggleFullscreen)
export const sendToast = dispatch(app.actions.sendToast)
export const sendErrorToast = dispatch(app.actions.sendErrorToast)
export const sendNotImplementedToast = dispatch(
  app.actions.sendNotImplementedToast,
)
export const notifyDownloadDone = dispatch(app.actions.notifyDownloadDone)
export const initEditModal = dispatch(app.actions.initEditModal)
export const setCurrentEpisode = dispatch(app.actions.setCurrentEpisode)
