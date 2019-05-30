import electron from 'electron'
import { ActionContext, Store } from 'vuex'
import request from 'superagent/dist/superagent'

import { getConfig } from '@/config'
import { setAnilist } from '@/state/auth'

import { userStore } from './user'
import { NO_OP, removeCookies } from '@/utils'
import { LOGGED_INTO_ANILIST } from '@/messages'

type BrowserWindow = electron.BrowserWindow
type StoreType = Store<any> | ActionContext<any, any>

interface Parameters {
  token: string
  expires: number
}

const { BrowserWindow } = electron.remote
let authWindow: BrowserWindow
const GQL_ENDPOINT = 'https://graphql.anilist.co'

export class Anilist {
  public static login() {
    return new Promise(resolve => {
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
      }) as BrowserWindow

      authWindow
        .loadURL(
          `https://anilist.co/api/v2/oauth/authorize?client_id=${getConfig(
            'ANILIST_ID',
          )}&response_type=token`,
        )
        .catch(NO_OP)

      authWindow.webContents.on('dom-ready', () => {
        authWindow.webContents.findInPage(LOGGED_INTO_ANILIST, {
          matchCase: true,
        })
      })

      authWindow.webContents.on('found-in-page', (_, result) => {
        if (result.matches < 1) return

        resolve()

        if (!authWindow) return
        authWindow.close()
        authWindow = null as any
      })

      authWindow.show()
    })
  }

  public static logOut = (store: StoreType) => {
    removeCookies({ domain: 'anilist.co' })

    setAnilist(store, {
      user: null,
      token: null,
      expires: null,
    })
  }

  public static async updateUserData(
    store: Store<any>,
    { token, expires }: Parameters,
  ) {
    return request
      .post(GQL_ENDPOINT)
      .auth(token, { type: 'bearer' })
      .send({ query: `query { user: Viewer { id name siteUrl } }` })
      .then(data => {
        const user = data.body.data.user

        if (!user) throw new Error('Could not get logged in user')

        userStore.set('anilist', { user, token, expires })
        setAnilist(store, { user, token, expires })
      })
  }
}
