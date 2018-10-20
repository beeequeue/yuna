// tslint:disable:no-use-before-declare
import { ActionContext } from 'vuex'
import { getStoreAccessors } from 'vuex-typescript'

import * as crunchyroll from '@/lib/crunchyroll'
import { RootState } from '@/state/store'
import { userStore } from '@/lib/user'
import { logoutAnilist } from '@/lib/anilist'

export interface CrunchyrollData {
  isLoggedIn: boolean
}

export interface AnilistData {
  token: string | null
  expires: number | null
}

export interface AuthState {
  crunchyroll: CrunchyrollData
  anilist: AnilistData
}

type AuthContext = ActionContext<AuthState, RootState>

const initialState: AuthState = {
  crunchyroll: {
    isLoggedIn: !!userStore.get('crunchyroll.token', false),
  },
  anilist: {
    token: userStore.get('anilist.token', null),
    expires: Number(userStore.get('anilist.expires', null)),
  },
}

export const auth = {
  state: { ...initialState },

  getters: {
    isLoggedIn(
      state: AuthState,
    ): { anilist: boolean; crunchyroll: boolean; all: boolean } {
      const anilist = state.anilist.token != null
      const _crunchyroll = state.crunchyroll.isLoggedIn

      return {
        anilist,
        crunchyroll: _crunchyroll,
        all: anilist && _crunchyroll,
      }
    },
  },

  mutations: {
    setCrunchyroll(state: AuthState, loggedIn: boolean) {
      state.crunchyroll.isLoggedIn = loggedIn
    },

    setAnilist(state: AuthState, data: AnilistData) {
      state.anilist = data

      userStore.set('anilist', data)
    },
  },

  actions: {
    async loginCrunchyroll(
      context: AuthContext,
      payload: { user: string; pass: string },
    ) {
      try {
        try {
          await crunchyroll.login(payload.user, payload.pass)
        } catch (e) {
          return Promise.reject(e)
        }

        setCrunchyroll(context, true)
      } catch (err) {
        return
      }
    },

    async logOut(context: AuthContext) {
      if (
        !context.state.crunchyroll.isLoggedIn &&
        !context.state.anilist.token
      ) {
        return
      }

      logoutAnilist()
      crunchyroll.logout()
      setCrunchyroll(context, false)
      setAnilist(context, {
        token: null,
        expires: null,
      })

      await crunchyroll.createSession()
    },
  },
}

const { commit, dispatch, read } = getStoreAccessors<AuthState, RootState>('')

export const getIsLoggedIn = read(auth.getters.isLoggedIn)

const setCrunchyroll = commit(auth.mutations.setCrunchyroll)
export const setAnilist = commit(auth.mutations.setAnilist)

export const loginCrunchyroll = dispatch(auth.actions.loginCrunchyroll)

export const logOut = dispatch(auth.actions.logOut)
