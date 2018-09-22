import Vue from 'vue'
import Vuex from 'vuex'
import { ipcRenderer } from 'electron'

import { app, AppState, sendToast, setIsUpdateAvailable } from './app'
import { auth, AuthState } from './auth'
import { user, UserState } from './user'
import { settings, SettingsState } from './settings'

Vue.use(Vuex)

const modules = { app, auth, user, settings }

ipcRenderer.on('UPDATE_AVAILABLE', () => {
  setIsUpdateAvailable(store, true)

  sendToast(store, {
    type: 'info',
    title: 'A new update is available!',
    message: 'Starting download...',
    consoleMessage: 'found new version',
    timeout: 5 * 1000,
  })
})
ipcRenderer.on('UPDATE_DONE', () => {
  sendToast(store, {
    type: 'success',
    title: 'Update downloaded!',
    message: 'It will be used next time the program is started!',
    consoleMessage: 'update downloaded',
    timeout: 15 * 1000,
  })
})
ipcRenderer.on('UPDATE_ERROR', () => {
  setIsUpdateAvailable(store, false)

  sendToast(store, {
    type: 'error',
    title: 'An error occurred downloading update.',
    message: 'Please try downloading it from GitHub.',
    consoleMessage: 'errored downloading update',
    timeout: 10 * 1000,
  })
})

export interface RootState {
  app: AppState
  auth: AuthState
  user: UserState
  settings: SettingsState
}

export const store = new Vuex.Store({
  modules,
  strict: process.env.NODE_ENV !== 'production',
})
