import { ipcRenderer } from 'electron'
import Vue from 'vue'
import Vuex from 'vuex'

import {
  UPDATE_AVAILABLE,
  UPDATE_DOWNLOADED,
  UPDATE_ERROR,
  DOWNLOAD_UPDATE,
} from '@/messages'

import { app, AppState, sendToast, setIsUpdateAvailable } from './app'
import { auth, AuthState } from './auth'
import { settings, SettingsState } from './settings'
import { user, UserState } from './user'

Vue.use(Vuex)

const modules = { app, auth, user, settings }

const downloadUpdate = () => ipcRenderer.send(DOWNLOAD_UPDATE)

ipcRenderer.on(UPDATE_AVAILABLE, () => {
  const { autoUpdate } = store.getters['settings/getSettings']
  const message = autoUpdate
    ? 'Starting download...'
    : 'Click this notification to download it!'

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

ipcRenderer.on(UPDATE_ERROR, () => {
  setIsUpdateAvailable(store, false)

  sendToast(store, {
    type: 'error',
    title: 'An error occurred downloading update.',
    message: 'Please try downloading it from GitHub.',
    timeout: 10 * 1000,
  })
})

export interface RootState {
  app: AppState
  auth: AuthState
  user: UserState
  settings: SettingsState
}

export const store = new Vuex.Store<RootState>({
  modules,
  strict: process.env.NODE_ENV !== 'production',
})
