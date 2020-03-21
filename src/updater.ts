import { platform } from 'os'
import { ipcMain } from 'electron'
import logger from 'electron-timber'
import { activeWindow } from 'electron-util'
import fetch from 'node-fetch'

import { isNil } from '@/utils'
import { CHECK_FOR_UPDATES, UPDATE_AVAILABLE } from './messages'

const timeBetweenUpdateChecks = 30 * 60 * 1000
let mainWindow: Electron.BrowserWindow | null = null
let updateInterval: NodeJS.Timer | null = null

type Version = {
  version: string
  releaseName: string
}
let availableVersion: Version | null = null

export const initUpdateChecker = () => {
  mainWindow = activeWindow()

  ipcMain.on(CHECK_FOR_UPDATES, () => {
    initCheckForUpdates()
  })
}

type GitHubRelease = {
  tag_name: string
  name: string
  url: string
  prerelease: boolean
  assets: Array<{
    name: string
    browser_download_url: string
  }>
}

const getExtension = () => {
  switch (platform()) {
    case 'darwin':
      return '.dmg'
    case 'win32':
      return '.exe'
    default:
      return null
  }
}

const defaultUrl = 'https://github.com/beeequeue/yuna/releases'
const getDownloadUrl = (data: GitHubRelease) => {
  const extension = getExtension()

  if (extension == null) {
    return defaultUrl
  }

  const url = data.assets.find(asset =>
    asset.browser_download_url.endsWith(extension),
  )

  return url?.browser_download_url ?? defaultUrl
}

const checkForUpdates = async () => {
  const response = await fetch(
    'https://api.github.com/repos/beeequeue/yuna/releases/latest',
  )

  const body = (await response.json()) as GitHubRelease

  if (!response.ok && updateInterval != null) {
    global.clearInterval(updateInterval)
    updateInterval = null

    return
  }

  sendMessage(UPDATE_AVAILABLE, getDownloadUrl(body))
}

const initCheckForUpdates = () => {
  checkForUpdates()

  updateInterval = setInterval(checkForUpdates, timeBetweenUpdateChecks)
}

const sendMessage = (message: string, arg?: string) => {
  if (isNil(mainWindow)) {
    setTimeout(() => sendMessage(message, arg), 1000)

    return
  }

  mainWindow.webContents.send(message, arg)
}
