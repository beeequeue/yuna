// tslint:disable:no-use-before-declare
import { ActionContext } from 'vuex'
import { getStoreAccessors } from 'vuex-typescript'

import * as crunchyroll from '@/lib/crunchyroll'
import { RootState } from '@/state/store'
import { userStore } from '@/lib/user'
import { logoutAnilist } from '@/lib/anilist'
import { createBothSessions } from '@/utils'

export interface CrunchyrollData {
  isLoggedIn: boolean
  country: string | null
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
    country: null,
  },
  anilist: {
    token: userStore.get('anilist.token', null),
    expires: Number(userStore.get('anilist.expires', null)),
  },
}

export const auth = {
  namespaced: true,

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

    getCrunchyrollCountry(state: AuthState) {
      return state.crunchyroll.country
    },
  },

  mutations: {
    setCrunchyroll(state: AuthState, loggedIn: boolean) {
      state.crunchyroll.isLoggedIn = loggedIn
    },

    setCrunchyrollCountry(state: AuthState, countryCode: string) {
      state.crunchyroll.country = countryCode
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

      const data = await createBothSessions(context)
      setCrunchyrollCountry(context, data.country_code)
    },
  },
}

const { commit, dispatch, read } = getStoreAccessors<AuthState, RootState>(
  'auth',
)

export const getIsLoggedIn = read(auth.getters.isLoggedIn)
export const getCrunchyrollCountry = read(auth.getters.getCrunchyrollCountry)

export const setCrunchyroll = commit(auth.mutations.setCrunchyroll)
export const setCrunchyrollCountry = commit(
  auth.mutations.setCrunchyrollCountry,
)
export const setAnilist = commit(auth.mutations.setAnilist)

export const loginCrunchyroll = dispatch(auth.actions.loginCrunchyroll)

export const logOut = dispatch(auth.actions.logOut)
