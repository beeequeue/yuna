// tslint:disable:no-use-before-declare
import { ActionContext } from 'vuex'

import * as crunchyroll from '@/lib/crunchyroll'
import { RootState } from '@/state/store'
import { getStoreAccessors } from 'vuex-typescript'

interface CrunchyrollData extends crunchyroll.User {
  token: string
  expires: Date
}

export interface AuthState {
  sessionId: string
  crunchyroll: CrunchyrollData | null
}

type AuthContext = ActionContext<AuthState, RootState>

const cachedSessionId = localStorage.getItem('sessionId')
const cachedUserString = localStorage.getItem('crunchyroll')

const initialState: AuthState = {
  sessionId: '',
  crunchyroll: null,
}

try {
  initialState.sessionId = JSON.parse(cachedSessionId || '""')
} catch (e) {
  localStorage.removeItem('sessionId')
}

try {
  initialState.crunchyroll = JSON.parse(cachedUserString || 'null')
} catch (e) {
  localStorage.removeItem('crunchyroll')
}

export const auth = {
  state: { ...initialState },

  getters: {
    isLoggedIn(state: AuthState) {
      return state.crunchyroll ? state.crunchyroll.token != null : false
    },

    getSessionId(state: AuthState) {
      return state.sessionId
    },
  },

  mutations: {
    setSessionId(state: AuthState, sessionId: string) {
      state.sessionId = sessionId

      localStorage.setItem('sessionId', JSON.stringify(sessionId))
    },

    setCrunchyroll(state: AuthState, data: CrunchyrollData) {
      state.crunchyroll = data

      localStorage.setItem('crunchyroll', JSON.stringify(data))
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
          data = await crunchyroll.login(
            payload.user,
            payload.pass,
            context.state.sessionId,
          )
        } catch (e) {
          return Promise.reject(e)
        }

        const crunchyrollData: CrunchyrollData = {
          ...data.user,
          token: data.auth,
          expires: data.expires,
        }

        setCrunchyroll(context, crunchyrollData)
      } catch (err) {
        return
      }
    },

    async logOutCrunchyroll(context: AuthContext) {
      if (!context.state.crunchyroll) return

      setCrunchyroll(context, null as any)
      await createSession(context)
    },
  },
}

const { commit, dispatch, read } = getStoreAccessors<AuthState, RootState>('')

export const isLoggedIn = read(auth.getters.isLoggedIn)
export const getSessionId = read(auth.getters.getSessionId)

const setSessionId = commit(auth.mutations.setSessionId)
const setCrunchyroll = commit(auth.mutations.setCrunchyroll)

export const createSession = dispatch(auth.actions.createSession)
export const loginCrunchyroll = dispatch(auth.actions.loginCrunchyroll)
export const logOutCrunchyroll = dispatch(auth.actions.logOutCrunchyroll)
