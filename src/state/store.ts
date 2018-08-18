import Vue from 'vue'
import Vuex from 'vuex'

import { auth, AuthState } from './auth'
import { user, UserState } from './user'

Vue.use(Vuex)

const modules = { auth, user }

export interface RootState {
  auth: AuthState
  user: UserState
}

export const store = new Vuex.Store({
  modules,
  strict: process.env.NODE_ENV !== 'production',
})
