import electron from 'electron'
import { log } from 'electron-log'
import request from 'superagent/superagent'

type BrowserWindow = electron.BrowserWindow
let authWindow: BrowserWindow
const { BrowserWindow } = electron.remote

const GQL_ENDPOINT = 'https://graphql.anilist.co'

export const loginAnilist = (callback: (newUrl: string) => void) => {
  authWindow = new BrowserWindow({
    width: 400,
    height: 600,
    center: true,
    maximizable: false,
    minimizable: false,
    resizable: false,
    show: false,
    title: 'AniList Login',
    darkTheme: true,
  })

  authWindow.webContents.on(
    'did-fail-load',
    (_event, _errorCode, _errorDescription, url) => {
      log(
        'got new url: ',
        url.replace(/access_token=.*&/, 'access_token=[secret]&'),
      )

      if (!authWindow) return

      if (!url.includes('access_token')) {
        return authWindow.webContents.insertText(
          '<h1 style="color: red">Something went very wrong :(</h1>',
        )
      }

      callback(url)

      authWindow.close()
      authWindow = null as any
    },
  )

  authWindow.webContents.on(
    'did-start-navigation' as any,
    (_: {}, url: string) => {
      log(
        'got new url: ',
        url.replace(/access_token=.*&/, 'access_token=[secret]&'),
      )

      if (!authWindow) return

      if (url.includes('access_token')) {
        callback(url)

        authWindow.close()
        authWindow = null as any
      }
    },
  )

  authWindow.loadURL(
    `https://anilist.co/api/v2/oauth/authorize?client_id=913&response_type=token`,
  )
  authWindow.show()
}

export const logoutAnilist = () => {
  if (!electron.remote.session.defaultSession) return

  /* tslint:disable no-empty */
  electron.remote.session.defaultSession.cookies.remove(
    'https://anilist.co',
    'remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d',
    () => {},
  )
  electron.remote.session.defaultSession.cookies.remove(
    'https://anilist.co',
    'laravel_session',
    () => {},
  )
  electron.remote.session.defaultSession.cookies.remove(
    'https://anilist.co',
    '__cfduid',
    () => {},
  )
  /* tslint:enable no-empty */
}

export const isValidToken = async (token: string) =>
  request
    .post(GQL_ENDPOINT)
    .auth(token, { type: 'bearer' })
    .send({
      query: `query { Viewer { name } }`,
    })
    .then(() => true)
    .catch(err => {
      // tslint:disable-next-line:no-console
      console.error(err)
      return false
    })
