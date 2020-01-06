import { ipcRenderer, shell } from 'electron'
import Vue from 'vue'
import Vuex from 'vuex'

import {
  ANILIST_LOGIN,
  DOWNLOAD_UPDATE,
  SHOW_ERROR,
  UPDATE_AVAILABLE,
  UPDATE_DOWNLOADED,
  UPDATE_ERROR,
} from '@/messages'

import {
  app,
  AppState,
  sendErrorToast,
  sendToast,
  setIsUpdateAvailable,
} from './app'
import { auth, AuthState } from './auth'
import { settings, SettingsState } from './settings'
import { user, UserState } from './user'
import { Anilist } from '@/lib/anilist'

Vue.use(Vuex)

const modules = { app, auth, user, settings }

const downloadUpdate = () => ipcRenderer.send(DOWNLOAD_UPDATE)

ipcRenderer.on(UPDATE_AVAILABLE, () => {
  const { autoUpdate } = store.getters['settings/getSettings']
  const message = autoUpdate
    ? 'Starting download...'
    : 'Click this notification to install it!'

  setIsUpdateAvailable(store, true)

  sendToast(store, {
    type: 'info',
    title: 'A new update is available!',
    message,
    timeout: 15 * 1000,
    click: !autoUpdate ? downloadUpdate : undefined,
  })

  if (!autoUpdate) return

  downloadUpdate()
})

ipcRenderer.on(UPDATE_DOWNLOADED, () => {
  setIsUpdateAvailable(store, false)

  sendToast(store, {
    type: 'success',
    title: 'Update downloaded!',
    message: 'It will be installed when the program closes!',
    timeout: 15 * 1000,
  })
})

let hasErrored = false
ipcRenderer.on(UPDATE_ERROR, (_e: any, version?: string) => {
  if (hasErrored) return
  hasErrored = true

  setIsUpdateAvailable(store, false)

  let url = 'https://github.com/BeeeQueue/yuna/releases'

  if (version) {
    url += `/tag/v${version}`
  }

  sendToast(store, {
    type: 'error',
    title: 'An error occurred downloading update.',
    message: 'Click here to download it manually from GitHub.',
    click: () => {
      shell.openExternal(url)
    },
    timeout: 30 * 1000,
  })
})

ipcRenderer.on(SHOW_ERROR, (_e: any, message: string) => {
  sendErrorToast(store, message)
})

type Parameters = {
  token: string
  expires: number
}

ipcRenderer.on(ANILIST_LOGIN, async (_: any, params: Parameters) => {
  await Anilist.updateUserData(store, params)
})

export type RootState = {
  app: AppState
  auth: AuthState
  user: UserState
  settings: SettingsState
}

export const store = new Vuex.Store<RootState>({
  modules,
  strict: process.env.NODE_ENV !== 'production',
})
