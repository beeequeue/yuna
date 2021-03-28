import electron from "electron"
import { ActionContext, Store } from "vuex"
import request from "superagent/dist/superagent"

import { getConfig } from "@/config"
import { setAnilist } from "@/state/auth"
import { NO_OP, removeCookies } from "@/utils"
import { updateMainListPlugin } from "@/state/settings"

type BrowserWindow = electron.BrowserWindow
type StoreType = Store<any> | ActionContext<any, any>

type Parameters = {
  token: string
  expires: number
}

const { BrowserWindow } = electron.remote
let authWindow: BrowserWindow
const GQL_ENDPOINT = "https://graphql.anilist.co"

export class Anilist {
  public static login() {
    return new Promise<Parameters>((resolve) => {
      authWindow = new BrowserWindow({
        width: 400,
        height: 600,
        center: true,
        maximizable: false,
        minimizable: false,
        resizable: false,
        show: false,
        title: "AniList Login",
        darkTheme: true,
        backgroundColor: "#111",
        webPreferences: { contextIsolation: false },
      })

      authWindow
        .loadURL(
          `https://anilist.co/api/v2/oauth/authorize?client_id=${getConfig(
            "ANILIST_ID",
          )}&response_type=token`,
        )
        .catch(NO_OP)

      authWindow.webContents.on("will-redirect", (_, url) => {
        const parsedUrl = new URL(url)
        const params = new URLSearchParams(parsedUrl.hash.slice(1))
        const token = params.get("access_token")
        const expires = params.get("expires_in")

        if (!token) return

        resolve({ token, expires: Date.now() + Number(expires!) })

        if (!authWindow) return
        authWindow.close()
        authWindow = null as any
      })

      authWindow.show()
    })
  }

  public static logOut = (store: StoreType) => {
    removeCookies({ domain: "anilist.co" })

    setAnilist(store, {
      user: null,
      token: null,
      expires: null,
    })

    updateMainListPlugin(store)
  }

  public static async updateUserData(store: Store<any>, { token, expires }: Parameters) {
    return request
      .post(GQL_ENDPOINT)
      .auth(token, { type: "bearer" })
      .send({ query: `query { user: Viewer { id name siteUrl } }` })
      .then((data) => {
        const user = data.body.data.user

        if (!user) throw new Error("Could not get logged in user")

        setAnilist(store, { user, token, expires })
        updateMainListPlugin(store)
      })
  }
}
