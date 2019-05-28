import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  protocol,
} from 'electron'
import electronDebug, { openDevTools } from 'electron-debug'
import Store from 'electron-store'
import { enforceMacOSAppLocation } from 'electron-util'
import { init } from '@sentry/node'
import { join } from 'path'
import { format as formatUrl } from 'url'
import {
  createProtocol,
  installVueDevtools,
} from 'vue-cli-plugin-electron-builder/lib'

import { destroyDiscord, registerDiscord } from './lib/discord'
import { ANILIST_LOGIN, LOGGED_INTO_ANILIST, OPEN_DEVTOOLS } from './messages'
import { initAutoUpdater } from './updater'
import { version } from '../package.json'

const isDevelopment = process.env.NODE_ENV !== 'production'
if (isDevelopment) {
  // Don't load any native (external) modules until the following line is run:
  // eslint-disable-next-line
  require('module').globalPaths.push(process.env.NODE_MODULES_PATH)
}

init({
  enabled: process.env.NODE_ENV === 'production',
  dsn: 'https://cd3bdb81216e42018409783fedc64b7d@sentry.io/1336205',
  environment: process.env.NODE_ENV,
  release: `v${version}`,
})

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null = null

// Standard scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
    },
  },
  {
    scheme: 'yuna',
    privileges: {
      supportFetchAPI: true,
    },
  },
])

// Register extra stuff
electronDebug({})

const createMainWindow = () => {
  const settingsStore = new Store<any>({ name: 'settings' })

  const position = settingsStore.get('window', {})

  const window = new BrowserWindow({
    width: 1200,
    height: 755,
    x: position.x,
    y: position.y,
    maximizable: false,
    frame: false,
    darkTheme: true,
    backgroundColor: '#111',
    webPreferences: {
      webSecurity: false,
      allowRunningInsecureContent: false,
      nodeIntegration: true,
    },
  })

  const template: MenuItemConstructorOptions[] = [
    {
      label: 'Edit',
      submenu: [
        {
          type: 'normal',
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo',
        },
        {
          type: 'normal',
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo',
        },
        { type: 'separator' },
        {
          type: 'normal',
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut',
        },
        {
          type: 'normal',
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy',
        },
        {
          type: 'normal',
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste',
        },
        {
          type: 'normal',
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall',
        },
      ],
    },
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: 'Yuna',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    })
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

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

  window.on('close', () => {
    settingsStore.set('window', mainWindow!.getBounds())
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

app.commandLine.appendSwitch('force-color-profile', 'srgb')

app.setAppUserModelId(process.execPath)

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
    mainWindow.once('did-finish-load' as any, () => mainWindow!.show)
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', async () => {
  enforceMacOSAppLocation()

  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    await installVueDevtools()
  }

  protocol.registerStringProtocol('yuna', async (req, cb) => {
    const matches = req.url!.match(
      /access_token=(.*)&.*&expires_in=(\d+)/,
    ) as RegExpMatchArray

    if (!matches || !matches[1]) {
      return cb('Failed to get token')
    }

    mainWindow!.webContents.send(ANILIST_LOGIN, {
      token: matches[1],
      expires: Date.now() + Number(matches[2]),
    })
    cb(LOGGED_INTO_ANILIST)
  })

  mainWindow = createMainWindow()
  mainWindow.once('did-finish-load' as any, () => mainWindow!.show)
})
