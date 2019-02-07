// eslint-disable no-use-before-declare
import { getStoreAccessors } from 'vuex-typescript'
import { omit } from 'rambdax'

import { userStore } from '@/lib/user'
import { RootState } from '@/state/store'

interface ServiceData {
  user: null | {
    id: number
    name: string
    url: string | null
  }
  token: string | null
  expires: number | null
}

export interface CrunchyrollData extends ServiceData {
  refreshToken: string
  token: string
  country: string | null
}

// eslint-disable-next-line no-empty-interface
export interface AnilistData extends ServiceData {}

export interface AuthState {
  crunchyroll: CrunchyrollData
  anilist: AnilistData
}

const initialState: AuthState = {
  crunchyroll: {
    user: userStore.get('crunchyroll.user', null),
    token: userStore.get('crunchyroll.token', null),
    expires: userStore.get('crunchyroll.expires', null),
    refreshToken: userStore.get('crunchyroll.refreshToken', null),
    country: null,
  },
  anilist: {
    user: userStore.get('anilist.user', null),
    token: userStore.get('anilist.token', null),
    expires: userStore.get('anilist.expires', null),
  },
}

export const auth = {
  namespaced: true,

  state: { ...initialState },

  getters: {
    getIsConnectedTo(
      state: AuthState,
    ): { anilist: boolean; crunchyroll: boolean; all: boolean } {
      const anilist = state.anilist.token != null
      const crunchyroll = state.crunchyroll.user != null

      return {
        anilist,
        crunchyroll,
        all: anilist && crunchyroll,
      }
    },

    getCrunchyrollCountry(state: AuthState) {
      return state.crunchyroll.country
    },

    getAnilistUserId(state: AuthState) {
      return state.anilist.user && state.anilist.user.id
    },

    getAnilistUsername(state: AuthState) {
      return state.anilist.user && state.anilist.user.name
    },
  },

  mutations: {
    setCrunchyroll(state: AuthState, data: Omit<CrunchyrollData, 'country'>) {
      state.crunchyroll.user = data.user
      state.crunchyroll.token = data.token
      state.crunchyroll.refreshToken = data.refreshToken
      state.crunchyroll.expires = data.expires

      const extraKeys = Object.keys(
        omit(['user', 'token', 'refreshToken', 'expires'], data),
      )
      if (extraKeys.length > 0) {
        // eslint-disable-next-line no-console
        console.warn(
          `Tried to set ${extraKeys} without setters in setCrunchyroll`,
        )
      }

      userStore.set('crunchyroll', data)
    },

    setCrunchyrollCountry(state: AuthState, countryCode: string) {
      state.crunchyroll.country = countryCode
    },

    setAnilist(state: AuthState, data: AnilistData) {
      state.anilist.user = data.user
      state.anilist.token = data.token
      state.anilist.expires = data.expires

      const extraKeys = Object.keys(omit(['user', 'token', 'expires'], data))
      if (extraKeys.length > 0) {
        // eslint-disable-next-line no-console
        console.warn(`Tried to set ${extraKeys} without setters in setAnilist`)
      }

      userStore.set('anilist', data)
    },
  },
}

const { commit, read } = getStoreAccessors<AuthState, RootState>('auth')

export const getIsConnectedTo = read(auth.getters.getIsConnectedTo)
export const getCrunchyrollCountry = read(auth.getters.getCrunchyrollCountry)
export const getAnilistUserId = read(auth.getters.getAnilistUserId)
export const getAnilistUsername = read(auth.getters.getAnilistUsername)

export const setCrunchyroll = commit(auth.mutations.setCrunchyroll)
export const setCrunchyrollCountry = commit(
  auth.mutations.setCrunchyrollCountry,
)
export const setAnilist = commit(auth.mutations.setAnilist)
