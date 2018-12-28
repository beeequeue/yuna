import { app, BrowserWindow, ipcMain, protocol } from 'electron'
import electronDebug, { openDevTools } from 'electron-debug'
import { join } from 'path'
import { format as formatUrl } from 'url'
import {
  createProtocol,
  installVueDevtools,
} from 'vue-cli-plugin-electron-builder/lib'

import { registerDiscord, destroyDiscord } from './lib/discord'
import { OPEN_DEVTOOLS } from './messages'
import { initAutoUpdater } from './updater'

const isDevelopment = process.env.NODE_ENV !== 'production'
if (isDevelopment) {
  // Don't load any native (external) modules until the following line is run:
  // tslint:disable-next-line
  require('module').globalPaths.push(process.env.NODE_MODULES_PATH)
}

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: any

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true })

// Register extra stuff
electronDebug({})

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 755,
    maximizable: false,
    frame: false,
    darkTheme: true,
    webPreferences: {
      webSecurity: false,
      allowRunningInsecureContent: false,
    },
  })

  initAutoUpdater()

  registerDiscord()

  if (isDevelopment) {
    // Load the url of the dev server if in development mode
    window.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) window.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    window.loadURL(
      formatUrl({
        pathname: join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      }),
    )
  }

  ipcMain.on(OPEN_DEVTOOLS, () => {
    openDevTools()
  })

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    destroyDiscord()

    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
    mainWindow.show()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    await installVueDevtools()
  }

  mainWindow = createMainWindow()
  mainWindow.show()
})
