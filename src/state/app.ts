import { activeWindow } from 'electron-util'
import {
  NotificationFunctionOptions,
  NotificationTypes,
} from 'vue-notifications'
import { ActionContext } from 'vuex'
import { getStoreAccessors } from 'vuex-typescript'

import {
  EpisodeListEpisodes,
  ListEntry as IListEntry,
  MediaListStatus,
  Provider,
} from '@/graphql/types'
import { router } from '@/router'
import { RootState } from '@/state/store'
import { generateId, isNil, pluck, propEq } from '@/utils'

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
  animeId: number
  title: string
  bannerImage: string
  episodes: number | null
  listEntry: Omit<IListEntry, '__typename' | 'mediaId' | 'media'>
}

export interface ManualSearchOptions {
  provider: Provider
  anilistId: number | null
  selectedEpisodes: EpisodeListEpisodes[]
}

export interface LocalSourceOptions {
  anilistId: number
}

export interface AppState {
  isUpdateAvailable: boolean
  toasts: Toast[]
  isFullscreen: boolean
  player: PlayerData | null
  anilistRequests: number
  modals: {
    about: ModalBase
    edit: ModalBase & {
      anime: EditModalAnime | null
    }
    manualSearch: ModalBase & ManualSearchOptions
    localSource: ModalBase & {
      options: LocalSourceOptions | null
    }
  }
}

export type ModalName = keyof AppState['modals']

type AppContext = ActionContext<AppState, RootState>

const initialModalBase: ModalBase = {
  visible: false,
}

const initialState: AppState = {
  isUpdateAvailable: false,
  toasts: [],
  isFullscreen: false,
  player: null,
  anilistRequests: 85,
  modals: {
    about: { ...initialModalBase },
    edit: {
      ...initialModalBase,
      anime: null,
    },
    manualSearch: {
      ...initialModalBase,
      provider: Provider.Crunchyroll,
      anilistId: null,
      selectedEpisodes: [],
    },
    localSource: {
      ...initialModalBase,
      options: null,
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

    getModalStates(
      state: AppState,
    ): { [key in keyof AppState['modals']]: boolean } {
      const entries = Object.entries(state.modals).map(
        ([key, obj]) => [key, obj.visible] as [string, boolean],
      )

      return entries.reduce(
        (obj, [key, value]) => {
          obj[key] = value

          return obj
        },
        {} as any,
      )
    },

    getEditingAnime(state: AppState) {
      return state.modals.edit.anime
    },

    getManualSearchOptions(state: AppState) {
      return state.modals.manualSearch
    },

    getLocalSourceAnime(state: AppState) {
      return state.modals.localSource.options
    },

    getIsFullscreen(state: AppState) {
      return state.isFullscreen
    },

    getSelectedEpisodes(state: AppState) {
      return state.modals.manualSearch.selectedEpisodes
    },

    getAnilistRequestsUntilLimiting(state: AppState) {
      return state.anilistRequests
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
      state.toasts = state.toasts.filter(
        toast => !propEq<typeof toast, 'id'>('id', id)(toast),
      )
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
      // To stop anime being passed by reference
      state.modals.edit.anime = JSON.parse(JSON.stringify(anime))
    },

    setEditingAnimeValue<K extends keyof EditModalAnime['listEntry']>(
      state: AppState,
      payload: {
        key: K
        value: EditModalAnime['listEntry'][K]
      },
    ) {
      if (!state.modals.edit.anime) return

      state.modals.edit.anime.listEntry[payload.key] = payload.value
    },

    setManualSearchOptions(state: AppState, options: ManualSearchOptions) {
      state.modals.manualSearch = {
        ...state.modals.manualSearch,
        ...options,
      }
    },

    setLocalSourceAnime(state: AppState, animeId: number) {
      state.modals.localSource.visible = true
      state.modals.localSource.options = {
        anilistId: animeId,
      }
    },

    setFullscreen(state: AppState, b: boolean) {
      const browserWindow = activeWindow()

      state.isFullscreen = b
      browserWindow.setFullScreen(b)
    },

    selectCrunchyrollEpisodes(
      state: AppState,
      episodes: EpisodeListEpisodes[],
    ) {
      const { selectedEpisodes } = state.modals.manualSearch
      const selectedIds = pluck('id', selectedEpisodes)

      const filteredEpisodes = episodes.filter(
        ({ id }) => !selectedIds.includes(id),
      )

      let count = selectedEpisodes.length
      let lastNumber = 0
      let duplicates = 0

      const episodeWithCorrectNumbers = filteredEpisodes.map(
        ({ episodeNumber, ...rest }) => {
          let newNumber = count + 1

          if (episodeNumber === lastNumber) {
            newNumber = count
          }

          const newEpisodeNumber = newNumber - duplicates

          const selectedEpisode: EpisodeListEpisodes = {
            ...rest,
            index: newEpisodeNumber - 1,
            episodeNumber: newEpisodeNumber,
          }

          if (episodeNumber === lastNumber) {
            duplicates++
          }

          lastNumber = episodeNumber
          count++

          return selectedEpisode
        },
      )

      state.modals.manualSearch.selectedEpisodes = [
        ...state.modals.manualSearch.selectedEpisodes,
        ...episodeWithCorrectNumbers,
      ]
    },

    unselectCrunchyrollEpisodes(state: AppState, ids: string[]) {
      const { selectedEpisodes } = state.modals.manualSearch

      const remainingEpisodes = selectedEpisodes.filter(
        episode => !ids.find(id => id === episode.id),
      )

      let lastEpNumber = 0
      const episodesWithFixedNumbers = remainingEpisodes.map(episode => {
        // TODO: implement fix for multiple episodes with same number
        let realNum = lastEpNumber + 1
        lastEpNumber = realNum

        return {
          ...episode,
          episodeNumber: realNum,
        }
      })

      state.modals.manualSearch.selectedEpisodes = episodesWithFixedNumbers
    },

    setAnilistRequests(state: AppState, requests: number) {
      state.anilistRequests = requests
    },
  },

  actions: {
    sendToast(context: AppContext, options: ToastOptions) {
      const realOptions = Object.assign(
        {},
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

    initManualSearch(
      context: AppContext,
      options: Omit<ManualSearchOptions, 'selectedEpisodes'>,
    ) {
      setManualSearchOptions(context, {
        ...options,
        selectedEpisodes: [],
      })
      toggleModal(context, 'manualSearch')
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
export const getModalStates = read(app.getters.getModalStates)
export const getEditingAnime = read(app.getters.getEditingAnime)
export const getManualSearchOptions = read(app.getters.getManualSearchOptions)
export const getLocalSourceOptions = read(app.getters.getLocalSourceAnime)
export const getIsFullscreen = read(app.getters.getIsFullscreen)
export const getSelectedEpisodes = read(app.getters.getSelectedEpisodes)
export const getAnilistRequestsUntilLimiting = read(
  app.getters.getAnilistRequestsUntilLimiting,
)

export const setIsUpdateAvailable = commit(app.mutations.setIsUpdateAvailable)
const setEditingAnime = commit(app.mutations.setEditingAnime)
export const setEditingAnimeValue = commit(app.mutations.setEditingAnimeValue)
export const setManualSearchOptions = commit(
  app.mutations.setManualSearchOptions,
)
export const setLocalSourceAnime = commit(app.mutations.setLocalSourceAnime)
export const removeToast = commit(app.mutations.removeToast)
const setPlaylist = commit(app.mutations.setPlaylist)
const _setCurrentEpisode = commit(app.mutations.setCurrentEpisode)
export const toggleModal = commit(app.mutations.toggleModal)
const addToast = commit(app.mutations.addToast)
export const closeAllModals = commit(app.mutations.closeAllModals)
export const setFullscreen = commit(app.mutations.setFullscreen)
export const selectCrunchyrollEpisodes = commit(
  app.mutations.selectCrunchyrollEpisodes,
)
export const unselectCrunchyrollEpisodes = commit(
  app.mutations.unselectCrunchyrollEpisodes,
)
export const setAnilistRequests = commit(app.mutations.setAnilistRequests)

export const toggleFullscreen = dispatch(app.actions.toggleFullscreen)
export const sendToast = dispatch(app.actions.sendToast)
export const sendErrorToast = dispatch(app.actions.sendErrorToast)
export const initEditModal = dispatch(app.actions.initEditModal)
export const initManualSearch = dispatch(app.actions.initManualSearch)
export const setCurrentEpisode = dispatch(app.actions.setCurrentEpisode)
