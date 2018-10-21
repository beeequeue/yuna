import Vue from 'vue'
import { getStoreAccessors } from 'vuex-typescript'
import Store from 'electron-store'
import { complement, equals, filter } from 'rambda'
import { Key } from 'ts-key-enum'

import { RootState } from '@/state/store'

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
  autoPlay: boolean
  autoMarkWatched: boolean
  keybindings: {
    [key: string]: KeybindingAction[]
  }
}

const settingsStore = new Store<SettingsState>({ name: 'settings' })

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
  m: [TOGGLE_MUTED],
  [Key.ArrowRight]: [SKIP_FORWARD],
  [Key.ArrowLeft]: [SKIP_BACK],
  f: [TOGGLE_FULLSCREEN],
}

const initialState: SettingsState = {
  autoPlay: settingsStore.get('autoPlay', true),
  autoMarkWatched: settingsStore.get('autoMarkWatched', true),
  keybindings: settingsStore.get('keybindings', { ...defaultBindings }),
}

export const settings = {
  namespaced: true,

  state: { ...initialState },

  getters: {
    getSettings(state: SettingsState) {
      return state
    },

    getShouldAutoPlay(state: SettingsState) {
      return state.autoPlay
    },

    getShouldAutoMarkWatched(state: SettingsState) {
      return state.autoMarkWatched
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

    getKeydownHandler(state: SettingsState) {
      return (actionFunctionMap: { [key: string]: () => any }) => (
        key: Key | string,
      ) => {
        const actions = state.keybindings[key]
        if (!actions) return

        actions.forEach(action => {
          if (actionFunctionMap[action]) {
            actionFunctionMap[action]()
          }
        })
      }
    },
  },

  mutations: {
    addKeybinding(
      state: SettingsState,
      options: {
        key: Key | string
        action: KeybindingAction
      },
    ) {
      const storedActions = state.keybindings[options.key]
      if (storedActions && storedActions.includes(options.action)) {
        return
      }

      let newActions = []

      if (!storedActions) {
        newActions = [options.action]
      } else {
        newActions = [...storedActions, options.action]
      }

      Vue.set(state.keybindings, options.key, newActions)

      settingsStore.set(`keybindings.${options.key}`, newActions)
    },

    removeKeybinding(
      state: SettingsState,
      options: {
        key: Key | string
        action: KeybindingAction
      },
    ) {
      const storedActions = state.keybindings[options.key]
      if (!storedActions || !storedActions.includes(options.action)) {
        return
      }

      const newActions = filter(
        complement(equals(options.action)),
        storedActions,
      )

      Vue.set(state.keybindings, options.key, newActions)

      if (newActions.length > 0) {
        settingsStore.set(`keybindings.${options.key}`, newActions)
      } else {
        settingsStore.delete(`keybindings.${options.key}`)
      }
    },

    resetKeybindings(state: SettingsState) {
      state.keybindings = { ...defaultBindings }

      settingsStore.set('keybindings', state.keybindings)
    },

    setSetting(
      state: SettingsState,
      options: {
        setting: keyof SettingsState
        value: SettingsState[typeof options.setting]
      },
    ) {
      if (!Object.keys(state).includes(options.setting)) {
        // tslint:disable-next-line:no-console
        console.error('Tried to set unknown setting: ' + options.setting)
      }

      state[options.setting] = options.value

      settingsStore.set(options.setting, options.value)
    },
  },

  actions: {},
}

const { read, commit } = getStoreAccessors<SettingsState, RootState>('settings')

export const getSettings = read(settings.getters.getSettings)
export const getShouldAutoPlay = read(settings.getters.getShouldAutoPlay)
export const getShouldAutoMarkWatched = read(
  settings.getters.getShouldAutoMarkWatched,
)
export const getKeybindings = read(settings.getters.getKeybindings)
export const getKeysForAction = read(settings.getters.getKeysForAction)
export const getKeydownHandler = read(settings.getters.getKeydownHandler)

export const addKeybinding = commit(settings.mutations.addKeybinding)
export const removeKeybinding = commit(settings.mutations.removeKeybinding)
export const resetKeybindings = commit(settings.mutations.resetKeybindings)
export const setSetting = commit(settings.mutations.setSetting)
