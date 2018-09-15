import { ActionContext } from 'vuex'
import { getStoreAccessors } from 'vuex-typescript'

import { RootState } from '@/state/store'
import Store from 'electron-store'
import { Key } from 'ts-key-enum'

export enum KeybindingAction {
  PAUSE = 'PAUSE',
  PLAY = 'PLAY',
  PAUSE_PLAY = 'PAUSE_PLAY',
  SKIP_BACK = 'SKIP_BACK',
  SKIP_FORWARD = 'SKIP_FORWARD',
  VOLUME_UP = 'VOLUME_UP',
  VOLUME_DOWN = 'VOLUME_DOWN',
  TOGGLE_MUTED = 'TOGGLE_MUTED',
  TOGGLE_FULLSCREEN = 'TOGGLE_FULLSCREEN',
}

export interface SettingsState {
  keybindings: {
    [key: string]: KeybindingAction[]
  }
}

const settingsStore = new Store<SettingsState>({ name: 'settings' })

type SettingsContext = ActionContext<SettingsState, RootState>

const {
  PAUSE_PLAY,
  VOLUME_UP,
  VOLUME_DOWN,
  TOGGLE_MUTED,
  SKIP_FORWARD,
  SKIP_BACK,
  TOGGLE_FULLSCREEN,
} = KeybindingAction

const defaultBindings = {
  ' ': [PAUSE_PLAY],
  [Key.ArrowUp]: [VOLUME_UP],
  [Key.ArrowDown]: [VOLUME_DOWN],
  M: [TOGGLE_MUTED],
  [Key.ArrowRight]: [SKIP_FORWARD],
  [Key.ArrowLeft]: [SKIP_BACK],
  F: [TOGGLE_FULLSCREEN],
}

const initialState: SettingsState = {
  keybindings: settingsStore.get('keybindings', defaultBindings),
}

export const settings = {
  state: { ...initialState },

  getters: {
    getSettings(state: SettingsState) {
      return state
    },

    getKeybindings(state: SettingsState) {
      return state.keybindings
    },

    getKeysForAction(
      state: SettingsState,
    ): (action: KeybindingAction) => Key[] {
      return action => {
        const keysWithAction = Object.keys(state.keybindings).filter(key => {
          const actions = state.keybindings[key]

          if (!actions || actions.length < 1) return false

          return actions.includes(action)
        })

        return keysWithAction as Key[]
      }
    },
  },

  mutations: {
    addKeybinding(
      state: SettingsState,
      options: {
        key: Key
        action: KeybindingAction
      },
    ) {
      const storedKey = state.keybindings[options.key]

      if (storedKey.includes(options.action)) {
        return
      }

      storedKey.push(options.action)

      settingsStore.set(`keybindings.${options.key}`, storedKey)
    },

    removeKeybinding(
      state: SettingsState,
      options: {
        key: Key
        action: KeybindingAction
      },
    ) {
      const storedKey = state.keybindings[options.key]

      if (!storedKey.includes(options.action)) {
        return
      }

      const index = storedKey.findIndex(action => action === options.action)

      storedKey.splice(index, 1)

      settingsStore.set(`keybindings.${options.key}`, storedKey)
    },

    resetKeybindings(state: SettingsState) {
      state.keybindings = defaultBindings

      settingsStore.set('keybindings', defaultBindings)
    },
  },

  actions: {},
}

const { read, commit, dispatch } = getStoreAccessors<SettingsState, RootState>(
  '',
)

export const getSettings = read(settings.getters.getSettings)
export const getKeybindings = read(settings.getters.getKeybindings)
export const getKeysForAction = read(settings.getters.getKeysForAction)

export const addKeybinding = commit(settings.mutations.addKeybinding)
export const removeKeybinding = commit(settings.mutations.removeKeybinding)
export const resetKeybindings = commit(settings.mutations.resetKeybindings)
