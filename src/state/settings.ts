import Vue from 'vue'
import { getStoreAccessors } from 'vuex-typescript'
import Store from 'electron-store'
import { complement, equals, filter } from 'rambdax'
import { Key } from 'ts-key-enum'

import { RootState } from '@/state/store'
import { hasKey } from '@/utils'

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

interface KeybingingSettings {
  [key: string]: KeybindingAction[]
}

interface SpoilerSettings {
  anime: {
    description: boolean
  }
  episode: {
    name: boolean
    thumbnail: boolean
  }
}

export interface SettingsState {
  autoMarkAsPlanning: boolean
  useCRUnblocker: boolean
  autoUpdate: boolean
  beta: boolean
  autoPlay: boolean
  autoMarkWatched: boolean
  keybindings: KeybingingSettings
  spoilers: SpoilerSettings
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

const defaultBindings: KeybingingSettings = {
  ' ': [PAUSE_PLAY],
  [Key.ArrowUp]: [VOLUME_UP],
  [Key.ArrowDown]: [VOLUME_DOWN],
  m: [TOGGLE_MUTED],
  [Key.ArrowRight]: [SKIP_FORWARD],
  [Key.ArrowLeft]: [SKIP_BACK],
  f: [TOGGLE_FULLSCREEN],
}

const defaultSpoilers: SpoilerSettings = {
  anime: {
    description: false,
  },
  episode: {
    name: false,
    thumbnail: false,
  },
}

const initialState: SettingsState = {
  autoMarkAsPlanning: settingsStore.get('autoMarkAsPlanning', true),
  useCRUnblocker: settingsStore.get('useCRUnblocker', true),
  autoUpdate: settingsStore.get('autoUpdate', true),
  beta: settingsStore.get('beta', false),
  autoPlay: settingsStore.get('autoPlay', true),
  autoMarkWatched: settingsStore.get('autoMarkWatched', true),
  keybindings: settingsStore.get('keybindings', { ...defaultBindings }),
  spoilers: settingsStore.get('spoilers', { ...defaultSpoilers }),
}

if (settingsStore.get('autoMarkWatched', null) === null) {
  settingsStore.set(initialState)
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

    getSpoilerSettings(state: SettingsState) {
      return state.spoilers
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

    setSpoiler(
      state: SettingsState,
      payload: {
        path: [keyof SettingsState['spoilers'], string]
        value: boolean
      },
    ) {
      if (!hasKey(state.spoilers[payload.path[0]], payload.path[1])) {
        // tslint:disable-next-line:no-console
        return console.error(
          'Tried to set unknown setting: ' + payload.path.join('.'),
        )
      }

      ;(state.spoilers[payload.path[0]] as any)[payload.path[1]] = payload.value

      settingsStore.set(['spoilers', ...payload.path].join('.'), payload.value)
    },

    setSetting(
      state: SettingsState,
      options: {
        setting: keyof SettingsState
        value: SettingsState[typeof options.setting]
      },
    ) {
      if (!hasKey(state, options.setting)) {
        // tslint:disable-next-line:no-console
        return console.error('Tried to set unknown setting: ' + options.setting)
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
export const getSpoilerSettings = read(settings.getters.getSpoilerSettings)

export const addKeybinding = commit(settings.mutations.addKeybinding)
export const removeKeybinding = commit(settings.mutations.removeKeybinding)
export const resetKeybindings = commit(settings.mutations.resetKeybindings)
export const setSpoiler = commit(settings.mutations.setSpoiler)
export const setSetting = commit(settings.mutations.setSetting)
