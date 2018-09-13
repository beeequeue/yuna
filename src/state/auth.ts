// tslint:disable:no-use-before-declare
import { ActionContext } from 'vuex'
import { getStoreAccessors } from 'vuex-typescript'

import * as crunchyroll from '@/lib/crunchyroll'
import { RootState } from '@/state/store'
import { userStore } from '@/lib/user'

export interface CrunchyrollData {
  sessionId: string
  token: string | null
  user: crunchyroll.User | null
}

export interface AnilistData {
  token: string | null
  expires: number | null
  // user: anilist.User | null
}

export interface AuthState {
  crunchyroll: CrunchyrollData
  anilist: AnilistData
}

type AuthContext = ActionContext<AuthState, RootState>

const initialState: AuthState = {
  crunchyroll: {
    sessionId: userStore.get('crunchyroll.sessionId', ''),
    token: userStore.get('crunchyroll.token', null),
    user: userStore.get('crunchyroll.user', null),
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
      const _crunchyroll = state.crunchyroll.token != null

      return {
        anilist,
        crunchyroll: _crunchyroll,
        all: anilist && _crunchyroll,
      }
    },

    getSessionId(state: AuthState): string {
      return state.crunchyroll.sessionId
    },
  },

  mutations: {
    setSessionId(state: AuthState, sessionId: string) {
      state.crunchyroll.sessionId = sessionId

      userStore.set('crunchyroll.sessionId', sessionId)
    },

    setCrunchyroll(state: AuthState, data: CrunchyrollData) {
      state.crunchyroll = data

      userStore.set('crunchyroll', data)
    },

    setAnilist(state: AuthState, data: AnilistData) {
      state.anilist = data

      userStore.set('anilist', data)
    },
  },

  actions: {
    async createSession(context: AuthContext) {
      const sessionId = await crunchyroll.createSession()
      setSessionId(context, sessionId)
    },

    async loginCrunchyroll(
      context: AuthContext,
      payload: { user: string; pass: string },
    ) {
      try {
        let data

        try {
          data = await crunchyroll.login(payload.user, payload.pass)
        } catch (e) {
          return Promise.reject(e)
        }

        setCrunchyroll(context, {
          sessionId: context.state.crunchyroll.sessionId,
          token: data.auth,
          user: data.user,
        })
      } catch (err) {
        return
      }
    },

    async logOut(context: AuthContext) {
      if (!context.state.crunchyroll.token && !context.state.anilist.token) {
        return
      }

      setCrunchyroll(context, {
        sessionId: '',
        token: null,
        user: null,
      })
      setAnilist(context, {
        token: null,
        expires: null,
      })

      await createSession(context)
    },
  },
}

const { commit, dispatch, read } = getStoreAccessors<AuthState, RootState>('')

export const getIsLoggedIn = read(auth.getters.isLoggedIn)
export const getSessionId = read(auth.getters.getSessionId)

const setSessionId = commit(auth.mutations.setSessionId)
const setCrunchyroll = commit(auth.mutations.setCrunchyroll)
export const setAnilist = commit(auth.mutations.setAnilist)

export const createSession = dispatch(auth.actions.createSession)
export const loginCrunchyroll = dispatch(auth.actions.loginCrunchyroll)

export const logOut = dispatch(auth.actions.logOut)
