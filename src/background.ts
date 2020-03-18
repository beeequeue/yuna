import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  protocol,
  screen,
} from 'electron'
import electronDebug, { openDevTools } from 'electron-debug'
import Store from 'electron-store'
import { enforceMacOSAppLocation } from 'electron-util'
import { init } from '@sentry/node'
import { join } from 'path'
import { format as formatUrl } from 'url'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

import { destroyDiscord, registerDiscord } from './lib/discord'
import {
  ANILIST_LOGIN,
  FFMPEG_RETRY,
  LOGGED_INTO_ANILIST,
  OPEN_DEVTOOLS,
  REGISTER_MEDIA_KEYS,
  UNREGISTER_MEDIA_KEYS,
} from './messages'
import { initUpdateChecker } from './updater'
import { version } from '../package.json'
import { SupportedMediaKeys } from '@/types'
import { clamp, debounce, enumKeysToArray } from '@/utils'
import { downloadBinariesIfNecessary } from '@/lib/ffmpeg/download'
// import { initDarkThemeWorkAround } from '@/utils/electron-win10darktheme-workaround'

const isDevelopment = process.env.NODE_ENV !== 'production'
if (isDevelopment) {
  // Don't load any native (external) modules until the following line is run:
  // eslint-disable-next-line
  require('module').globalPaths.push(process.env.NODE_MODULES_PATH)
}

// initDarkThemeWorkAround()

init({
  enabled: process.env.NODE_ENV === 'production',
  dsn: 'https://cd3bdb81216e42018409783fedc64b7d@sentry.io/1336205',
  environment: process.env.NODE_ENV,
  release: `v${version}`,
  ignoreErrors: [
    /operation not permitted/,
    /temp-yuna-setup/,
    /.*net::ERR.*/,
    /child "activity" fails/,
    /ENOENT/,
    /EPERM/,
    /Origin not allowed/,
    /code signature/,
    /connection closed/,
    /RPC_CONNECTION_TIMEOUT/,
    /Cannot read property 'write' of null/,
    /Redirect was cancelled/,
    /no such file/,
    /Cannot find latest/,
    /Cannot parse releases feed/,
    /The play\(\) request was interrupted/,
  ],
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

const registerMediaKeys = (window: BrowserWindow) => {
  enumKeysToArray(SupportedMediaKeys).forEach(key =>
    globalShortcut.register(key, () =>
      window.webContents.send(SupportedMediaKeys[key]),
    ),
  )
}

const unregisterMediaKeys = () => {
  enumKeysToArray(SupportedMediaKeys).forEach(key => {
    globalShortcut.unregister(key)
  })
}

const defaultSize = {
  width: 1200,
  height: 755,
}

const min = (num: number, num2: number) => (num < num2 ? num : num2)
const max = (num: number, num2: number) => (num >= num2 ? num : num2)

const createMainWindow = () => {
  const settingsStore = new Store<any>({ name: 'settings' })

  const position = settingsStore.get('window', {})
  const bounds = screen.getAllDisplays().reduce(
    (obj, { bounds }) => {
      obj.x = [min(bounds.x, obj.x[0]), max(bounds.x + bounds.width, obj.x[1])]
      obj.y = [min(bounds.y, obj.y[0]), max(bounds.y + bounds.height, obj.y[1])]

      return obj
    },
    { x: [Infinity, -Infinity], y: [Infinity, -Infinity] },
  )

  const window = new BrowserWindow({
    width: defaultSize.width,
    height: defaultSize.height,
    show: false,
    x: clamp(position.x, bounds.x[0], bounds.x[1] - defaultSize.width),
    y: clamp(position.y, bounds.y[0], bounds.y[1] - defaultSize.height),
    maximizable: false,
    frame: false,
    darkTheme: true,
    backgroundColor: '#111',
    webPreferences: {
      webSecurity: false,
      allowRunningInsecureContent: false,
      nodeIntegration: !!process.env.ELECTRON_NODE_INTEGRATION,
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
          role: 'selectAll',
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
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    })
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  initUpdateChecker()

  registerDiscord()

  if (!process.env.IS_TEST) {
    if (isDevelopment || process.argv.includes('--devtools')) {
      window.webContents.openDevTools()
    }
  }

  if (isDevelopment) {
    // Load the url of the dev server if in development mode
    window.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
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

  ipcMain.on(OPEN_DEVTOOLS, () => openDevTools())
  ipcMain.on(REGISTER_MEDIA_KEYS, () => registerMediaKeys(window))
  ipcMain.on(UNREGISTER_MEDIA_KEYS, () => unregisterMediaKeys())
  ipcMain.on(FFMPEG_RETRY, () => downloadBinariesIfNecessary(mainWindow!, true))

  const saveWindowLocation = debounce(() => {
    settingsStore.set('window', {
      ...mainWindow!.getBounds(),
      ...defaultSize,
    })
  }, 250)

  window.on('move', () => saveWindowLocation())

  window.on('closed', () => {
    mainWindow = null
    unregisterMediaKeys()
  })

  window.once('ready-to-show', () => {
    mainWindow!.show()

    if (!settingsStore.get('ffmpegFailed')) {
      downloadBinariesIfNecessary(mainWindow!)
    }
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
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', async () => {
  enforceMacOSAppLocation()

  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // await installVueDevtools()
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
})
