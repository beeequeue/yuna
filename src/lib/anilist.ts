import electron from 'electron'
import request from 'superagent/superagent'

type BrowserWindow = electron.BrowserWindow
let authWindow: BrowserWindow
const { BrowserWindow } = electron.remote

const GQL_ENDPOINT = 'https://graphql.anilist.co'

export const loginAnilist = (callback: (newUrl: string) => void) => {
  authWindow = new BrowserWindow({
    width: 800,
    height: 600,
    center: true,
    maximizable: false,
    minimizable: false,
    resizable: false,
    show: false,
    title: 'AniList Login',
  })

  authWindow.webContents.on(
    'did-get-redirect-request',
    (_event: any, _oldUrl: string, newUrl: string) => {
      if (!authWindow) return

      if (newUrl.includes('access_token')) {
        callback(newUrl)

        authWindow.close()
        authWindow = null as any
      } else {
        authWindow.close()
        throw new Error('Couldn\'t get access token')
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
