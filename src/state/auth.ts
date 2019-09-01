// eslint-disable no-use-before-declare
import { getStoreAccessors } from 'vuex-typescript'
import { oc } from 'ts-optchain'

import { userStore } from '@/lib/user'
import { RootState } from '@/state/store'
import { HidiveProfile } from '@/lib/hidive'
import { isNil, omit, propEq } from '@/utils'

interface ServiceData {
  user: null | {
    id: number | string
    name: string
    url: string | null
  }
}

interface TokenService extends ServiceData {
  token: string | null
  expires: number | null
}

interface UserPassService extends ServiceData {
  login: {
    user: string
    password: string
  }
}

export interface CrunchyrollData extends TokenService {
  refreshToken: string
  token: string
  country: string | null
}

// eslint-disable-next-line no-empty-interface
export interface AnilistData extends TokenService {}

export interface HidiveData extends UserPassService {
  profiles: HidiveProfile[]
  user: null | {
    id: number
    profile: number
    name: string
    url: string | null
  }
}

export interface SimklData extends TokenService {}

export interface AuthState {
  crunchyroll: CrunchyrollData
  anilist: AnilistData
  hidive: HidiveData
  simkl: SimklData
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
  hidive: {
    profiles: userStore.get('hidive.profiles', []),
    user: userStore.get('hidive.user', null),
    login: {
      user: userStore.get('hidive.login.user', null),
      password: userStore.get('hidive.login.password', null),
    },
  },
  simkl: {
    token: userStore.get('simkl.token', null),
    expires: userStore.get('simkl.expires', null),
    user: userStore.get('simkl.user', null),
  },
}

export const auth = {
  namespaced: true,

  state: { ...initialState },

  getters: {
    getIsConnectedTo(state: AuthState) {
      const anilist = !isNil(state.anilist.token)
      const crunchyroll = !isNil(state.crunchyroll.user)
      const hidive = !isNil(state.hidive.user)
      const simkl = !isNil(state.simkl.user)

      return {
        anilist,
        crunchyroll,
        hidive,
        simkl,
      }
    },

    getFinishedConnecting(state: AuthState) {
      return (
        !isNil(state.anilist.token) &&
        (!isNil(state.crunchyroll.user) || !isNil(state.hidive.user))
      )
    },

    getCrunchyrollCountry(state: AuthState) {
      return state.crunchyroll.country
    },

    getAnilistUserId(state: AuthState): number | null {
      return state.anilist.user && (state.anilist.user.id as number | null)
    },

    getAnilistUsername(state: AuthState): string | null {
      return state.anilist.user && state.anilist.user.name
    },

    getHidiveProfiles(state: AuthState) {
      return state.hidive.profiles
    },

    getHidiveProfileIndex(state: AuthState) {
      const selectedId = oc(state).hidive.user.profile()

      if (isNil(selectedId)) return -1

      return state.hidive.profiles.findIndex(propEq('Id', selectedId))
    },

    getHidiveLogin(state: AuthState) {
      if (isNil(state.hidive.user)) return null

      const { user, password } = state.hidive.login

      return {
        user,
        password,
      }
    },
  },

  mutations: {
    setCrunchyroll(state: AuthState, data: Omit<CrunchyrollData, 'country'>) {
      state.crunchyroll.user = data.user
      state.crunchyroll.token = data.token
      state.crunchyroll.refreshToken = data.refreshToken
      state.crunchyroll.expires = data.expires

      const extraKeys = Object.keys(
        omit(data, ['user', 'token', 'refreshToken', 'expires']),
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

      const extraKeys = Object.keys(omit(data, ['user', 'token', 'expires']))
      if (extraKeys.length > 0) {
        // eslint-disable-next-line no-console
        console.warn(`Tried to set ${extraKeys} without setters in setAnilist`)
      }

      userStore.set('anilist', data)
    },

    setHidive(state: AuthState, data: Required<HidiveData> | null) {
      if (data == null) {
        state.hidive = {
          user: null,
          profiles: [],
          login: null as any,
        }

        userStore.set('hidive', state.hidive)
        return
      }

      state.hidive = {
        ...data,
        user: {
          id: data.user!.id,
          profile: data.user!.profile,
          name: data.user!.name,
          url: 'https://hidive.com/profile/edit',
        },
      }

      userStore.set('hidive', data)
    },

    setHidiveProfile(state: AuthState, index: number) {
      const profile = state.hidive.profiles[index]

      state.hidive.user = {
        id: state.hidive.user!.id,
        url: state.hidive.user!.url,
        name: profile.Nickname,
        profile: profile.Id,
      }

      userStore.set('hidive', state.hidive)
    },

    setSimkl(state: AuthState, data: Required<SimklData> | null) {
      if (data == null) {
        state.simkl = {
          user: null,
          expires: null,
          token: null,
        }

        userStore.set('simkl', state.simkl)
        return
      }

      state.simkl = {
        ...data,
        user: {
          id: data.user!.id,
          name: data.user!.name,
          url: 'https://hidive.com/profile/edit',
        },
      }

      userStore.set('simkl', data)
    },
  },
}

const { commit, read } = getStoreAccessors<AuthState, RootState>('auth')

export const getIsConnectedTo = read(auth.getters.getIsConnectedTo)
export const getFinishedConnecting = read(auth.getters.getFinishedConnecting)
export const getCrunchyrollCountry = read(auth.getters.getCrunchyrollCountry)
export const getAnilistUserId = read(auth.getters.getAnilistUserId)
export const getAnilistUsername = read(auth.getters.getAnilistUsername)
export const getHidiveProfiles = read(auth.getters.getHidiveProfiles)
export const getHidiveProfileIndex = read(auth.getters.getHidiveProfileIndex)
export const getHidiveLogin = read(auth.getters.getHidiveLogin)

export const setCrunchyroll = commit(auth.mutations.setCrunchyroll)
export const setCrunchyrollCountry = commit(
  auth.mutations.setCrunchyrollCountry,
)
export const setAnilist = commit(auth.mutations.setAnilist)
export const setHidive = commit(auth.mutations.setHidive)
export const setHidiveProfile = commit(auth.mutations.setHidiveProfile)
export const setSimkl = commit(auth.mutations.setSimkl)
