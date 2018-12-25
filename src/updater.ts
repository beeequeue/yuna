import { ipcMain } from 'electron'
import { activeWindow } from 'electron-util'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import Store from 'electron-store'

import {
  DOWNLOAD_UPDATE,
  UPDATE_AVAILABLE,
  UPDATE_DOWNLOADED,
  UPDATE_ERROR,
  CHECK_FOR_UPDATES,
} from './messages'

const settingsStore = new Store({ name: 'settings' })

log.transports.file.level = 'debug'
autoUpdater.logger = log
autoUpdater.allowPrerelease = settingsStore.get('beta') || false
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = false

const timeBetweenUpdateChecks = 30 * 60 * 1000
let mainWindow: Electron.BrowserWindow
let updateInterval: NodeJS.Timer | null = null

const setAllProgressBars = (progress: number) => {
  mainWindow.setProgressBar(progress)
}

export const initAutoUpdater = () => {
  mainWindow = activeWindow()

  ipcMain.on(DOWNLOAD_UPDATE, () => {
    autoUpdater.downloadUpdate()
    autoUpdater.autoInstallOnAppQuit = true
  })

  ipcMain.on(CHECK_FOR_UPDATES, () => {
    initCheckForUpdates()
  })
}

const initCheckForUpdates = () => {
  autoUpdater.allowPrerelease = settingsStore.get('beta') || false
  autoUpdater.checkForUpdates()

  updateInterval = setInterval(() => {
    autoUpdater.allowPrerelease = settingsStore.get('beta') || false

    autoUpdater.checkForUpdates()
  }, timeBetweenUpdateChecks)
}

const sendMessage = (message: string) => {
  mainWindow.webContents.send(message)
}

autoUpdater.on('update-available', () => {
  clearInterval(updateInterval as any)
  sendMessage(UPDATE_AVAILABLE)
})

autoUpdater.signals.progress(progress => {
  setAllProgressBars(progress.percent || -1)
})

autoUpdater.signals.updateDownloaded(() => {
  setAllProgressBars(-1)

  sendMessage(UPDATE_DOWNLOADED)
})

autoUpdater.on('error', info => {
  log.error(info)

  clearInterval(updateInterval as any)
  sendMessage(UPDATE_ERROR)

  setAllProgressBars(-1)
})
