import Vue from 'vue'
import Vuex from 'vuex'

import { app, AppState } from './app'
import { auth, AuthState } from './auth'
import { user, UserState } from './user'

Vue.use(Vuex)

const modules = { app, auth, user }

export interface RootState {
  app: AppState
  auth: AuthState
  user: UserState
}

export const store = new Vuex.Store({
  modules,
  strict: process.env.NODE_ENV !== 'production',
})
