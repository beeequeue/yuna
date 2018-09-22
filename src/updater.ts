import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

log.transports.file.level = 'debug'
autoUpdater.logger = log
autoUpdater.allowPrerelease = true

const timeBetweenUpdateChecks = 30 * 60 * 1000
let mainWindow: Electron.BrowserWindow

const setAllProgressBars = (progress: number) => {
  mainWindow.setProgressBar(progress)
}

export const initCheckForUpdates = (window: Electron.BrowserWindow) => {
  autoUpdater.checkForUpdates()

  mainWindow = window

  setTimeout(() => {
    autoUpdater.checkForUpdates()
  }, timeBetweenUpdateChecks)
}

const sendMessage = (message: string) => {
  mainWindow.webContents.send(message)
}

const setIsUpdateAvailable = (available: boolean) => {
  sendMessage(available ? 'UPDATE_AVAILABLE' : 'UPDATE_UNAVAILABLE')
}

autoUpdater.on('update-available', () => {
  log.info('found update!')
  setIsUpdateAvailable(true)
})

autoUpdater.signals.progress(progress => {
  setAllProgressBars(progress.percent || -1)
})

autoUpdater.signals.updateDownloaded(() => {
  log.info('downloaded update')
  setAllProgressBars(-1)

  sendMessage('UPDATE_DONE')
  autoUpdater.autoInstallOnAppQuit = true
})

autoUpdater.on('error', info => {
  log.error(info)

  sendMessage('UPDATE_ERROR')

  setAllProgressBars(-1)
})
