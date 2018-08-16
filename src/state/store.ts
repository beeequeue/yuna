import Vue from 'vue'
import Vuex, { Store } from 'vuex'

import { auth, AuthState } from './auth'

Vue.use(Vuex)

const modules = { auth }

export type RootState = AuthState
export const store = new Store({
  modules,
  strict: process.env.NODE_ENV !== 'production',
})
