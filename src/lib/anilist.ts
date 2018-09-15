import electron from 'electron'
import request from 'superagent/superagent'

type BrowserWindow = electron.BrowserWindow
let authWindow: BrowserWindow | null
const { BrowserWindow } = electron.remote

const GQL_ENDPOINT = 'https://graphql.anilist.co'

export const loginAnilist = (callback: (newUrl: string) => void) => {
  authWindow = new BrowserWindow({
    width: 800,
    height: 600,
    center: true,
    maximizable: false,
    frame: false,
    show: false,
    title: 'AniList Login',
  })

  authWindow.webContents.on(
    'did-get-redirect-request',
    (_event: any, _oldUrl: string, newUrl: string) => {
      if (!authWindow) return

      callback(newUrl)
      authWindow.close()
      authWindow = null
    },
  )

  authWindow.loadURL(
    `https://anilist.co/api/v2/oauth/authorize?client_id=${
      process.env.ANILIST_ID
    }&response_type=token`,
  )
  authWindow.show()
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
