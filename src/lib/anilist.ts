import electron from 'electron'
import { info } from 'electron-log'
import { captureException } from '@sentry/browser'
import { ActionContext, Store } from 'vuex'
import request from 'superagent/dist/superagent'

import { getConfig } from '@/config'
import { AnilistData, setAnilist } from '@/state/auth'

import { userStore } from './user'
import { NO_OP, removeCookies } from '@/utils'

type BrowserWindow = electron.BrowserWindow
type StoreType = Store<any> | ActionContext<any, any>
let authWindow: BrowserWindow
let resolveLogin: () => any
const { BrowserWindow } = electron.remote

const GQL_ENDPOINT = 'https://graphql.anilist.co'

const handleNewURL = async (
  store: StoreType,
  url: string,
  eventName?: string,
) => {
  if (!url || typeof url !== 'string') {
    return captureException(
      `AniList Login: Didn't get url in handleNewUrl: ${url}`,
    )
  }

  if (url.includes('anilist.co/api/v2/oauth/authorize')) return

  // Due to dumb-ass American ISPs stealing our OAuth redirections
  url = decodeURIComponent(url)

  info(
    `${eventName}: got new url: `,
    url.replace(/access_token=.*&/, 'access_token=[secret]&'),
  )

  if (!authWindow) return

  if (!url.includes('access_token')) {
    captureException(
      `AniList Login: Could not find access token in URL: ${url}`,
    )

    authWindow.close()
    return
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

export const loginAnilist = (store: StoreType) =>
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

    authWindow
      .loadURL(
        `https://anilist.co/api/v2/oauth/authorize?client_id=${getConfig(
          'ANILIST_ID',
        )}&response_type=token`,
      )
      .catch(NO_OP)

    authWindow.show()
  })

export const logoutAnilist = (store: StoreType) => {
  removeCookies({ domain: 'anilist.co' })

  setAnilist(store, {
    user: null,
    token: null,
    expires: null,
  })
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
