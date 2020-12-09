import { StoreOptions } from "vuex"

import { app, AppState } from "./app"
import { auth, AuthState } from "./auth"
import { settings, SettingsState } from "./settings"
import { user, UserState } from "./user"

const modules = { app, auth, user, settings }

export type RootState = {
  app: AppState
  auth: AuthState
  user: UserState
  settings: SettingsState
}

export const storeOptions: StoreOptions<any> = {
  modules,
  strict: process.env.NODE_ENV !== "production",
}
