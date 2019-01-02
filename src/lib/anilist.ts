import electron from 'electron'
import { log } from 'electron-log'
import { captureException } from '@sentry/browser'
import { Store } from 'vuex'
import request from 'superagent/superagent'

import { getConfig } from '@/config'
import { AnilistData, setAnilist } from '@/state/auth'

import { userStore } from './user'

type BrowserWindow = electron.BrowserWindow
let authWindow: BrowserWindow
let resolveLogin: () => any
const { BrowserWindow } = electron.remote

const GQL_ENDPOINT = 'https://graphql.anilist.co'

const handleNewURL = async (
  store: Store<any>,
  url: string,
  eventName?: string,
) => {
  if (!url || typeof url !== 'string') {
    return captureException(
      `AniList Login: Didn't get url in handleNewUrl: ${url}`,
    )
  }

  // Due to dumb-ass American ISPs stealing our OAuth redirections
  url = decodeURIComponent(url)

  log(
    `${eventName}: got new url: `,
    url.replace(/access_token=.*&/, 'access_token=[secret]&'),
  )

  if (!authWindow) return

  if (!url.includes('access_token')) {
    captureException(
      `AniList Login: Could not find access token in URL: ${url}`,
    )

    authWindow.close()

    electron.dialog.showErrorBox(
      'Error Authenticating AniList',
      'Something went wrong logging you in. Please ask for help in the forum thread!\n https://anilist.co/forum/thread/6136',
    )
  }

  const matches = url.match(
    /access_token=(.*)&.*&expires_in=(\d+)/,
  ) as RegExpMatchArray

  const anilistData = await getAnilistData({
    token: matches[1],
    expires: Date.now() + Number(matches[2]),
  })

  setAnilist(store, anilistData)
  if (resolveLogin) resolveLogin()

  authWindow.close()
  authWindow = null as any
}

export const loginAnilist = (store: Store<any>) =>
  new Promise(resolve => {
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
      backgroundColor: '#111',
    })

    resolveLogin = resolve

    authWindow.webContents.on('did-fail-load', (_e, _c, _d, url) =>
      handleNewURL(store, url, 'did-fail-load'),
    )

    authWindow.webContents.on('will-navigate', (_e, url) =>
      handleNewURL(store, url, 'will-navigate'),
    )

    authWindow.loadURL(
      `https://anilist.co/api/v2/oauth/authorize?client_id=${getConfig(
        'ANILIST_ID',
      )}&response_type=token`,
    )
    authWindow.show()
  })

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

interface Parameters {
  token: string
  expires: number
}
export const getAnilistData = async ({ token, expires }: Parameters) =>
  request
    .post(GQL_ENDPOINT)
    .auth(token, { type: 'bearer' })
    .send({ query: `query { user: Viewer { id name siteUrl } }` })
    .then(
      (data): AnilistData => {
        const user = data.body.data.user

        if (!user) throw new Error('Could not get logged in user')

        userStore.set('anilist', { user, token, expires })

        return {
          user,
          token,
          expires,
        }
      },
    )
