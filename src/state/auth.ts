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

export interface AuthState {
  crunchyroll: CrunchyrollData
}

type AuthContext = ActionContext<AuthState, RootState>

const initialState: AuthState = {
  crunchyroll: {
    sessionId: userStore.get('crunchyroll.sessionId', ''),
    token: userStore.get('crunchyroll.token', null),
    user: userStore.get('crunchyroll.user', null),
  },
}

export const auth = {
  state: { ...initialState },

  getters: {
    isLoggedIn(state: AuthState): boolean {
      return state.crunchyroll.token != null
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

    async logOutCrunchyroll(context: AuthContext) {
      if (!context.state.crunchyroll) return

      setCrunchyroll(context, {
        sessionId: '',
        token: null,
        user: null,
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

export const createSession = dispatch(auth.actions.createSession)
export const loginCrunchyroll = dispatch(auth.actions.loginCrunchyroll)
export const logOutCrunchyroll = dispatch(auth.actions.logOutCrunchyroll)
