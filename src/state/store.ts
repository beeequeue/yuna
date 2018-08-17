import Vue from 'vue'
import Vuex from 'vuex'

import { auth, AuthState } from './auth'

Vue.use(Vuex)

const modules = { auth }

export interface RootState {
  auth: AuthState
}

export const store = new Vuex.Store({
  modules,
  strict: process.env.NODE_ENV !== 'production',
})
