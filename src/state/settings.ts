import { ipcRenderer } from 'electron'
import Store from 'electron-store'
import { Key } from 'ts-key-enum'
import Vue from 'vue'
import { ActionContext } from 'vuex'
import { getStoreAccessors } from 'vuex-typescript'

import {
  DISCORD_DISABLE_RICH_PRESENCE,
  DISCORD_ENABLE_RICH_PRESENCE,
} from '@/messages'
import { RootState } from '@/state/store'
import { enumKeysToArray, hasKey, isNotNil } from '@/utils'

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
  FRAME_FORWARD = 'FRAME_FORWARD',
  FRAME_BACK = 'FRAME_BACK',
}

type KeybindingSettings = {
  [key: string]: KeybindingAction[]
}

type ExternalPlayerPaths = {
  vlc: string | null
}

type SpoilerSettings = {
  anime: {
    description: boolean
  }
  episode: {
    name: boolean
    thumbnail: boolean
  }
}

type DiscordSettings = {
  richPresence: boolean
}

export enum SetupStep {
  LIST_MANAGERS = 'LIST_MANAGERS',
  CONNECT = 'CONNECT',
  SPOILERS = 'SPOILERS',
  DISCORD = 'DISCORD',
  LOCAL_FILES = 'LOCAL_FILES',
}

export const _setupSteps = enumKeysToArray(SetupStep) as SetupStep[]

type SetupSettings = {
  finishedSteps: SetupStep[]
}

export enum EpisodeFeedMode {
  LIST = 'LIST',
  QUEUE = 'QUEUE',
}

export type SettingsState = {
  episodeFeedMode: EpisodeFeedMode
  autoMarkAsPlanning: boolean
  useCRUnblocker: boolean
  crLocale: string
  autoUpdate: boolean
  beta: boolean
  autoPlay: boolean
  autoMarkWatched: boolean
  discord: DiscordSettings
  keybindings: KeybindingSettings
  spoilers: SpoilerSettings
  externalPlayers: ExternalPlayerPaths
  localFilesFolder: string | null
  mainListPlugin: string | null
  setup: SetupSettings
  window: Electron.Rectangle
}

type SettingsContext = ActionContext<SettingsState, RootState>

export const SettingsStore = new Store<any>({ name: 'settings' })

const {
  PAUSE_PLAY,
  VOLUME_UP,
  VOLUME_DOWN,
  TOGGLE_MUTED,
  SKIP_FORWARD,
  SKIP_BACK,
  TOGGLE_FULLSCREEN,
  FRAME_FORWARD,
  FRAME_BACK,
} = KeybindingAction

const defaultBindings: KeybindingSettings = {
  ' ': [PAUSE_PLAY],
  [Key.ArrowUp]: [VOLUME_UP],
  [Key.ArrowDown]: [VOLUME_DOWN],
  m: [TOGGLE_MUTED],
  [Key.ArrowRight]: [SKIP_FORWARD],
  [Key.ArrowLeft]: [SKIP_BACK],
  f: [TOGGLE_FULLSCREEN],
  '.': [FRAME_FORWARD],
  ',': [FRAME_BACK],
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

const defaultDiscord: DiscordSettings = {
  richPresence: true,
}

const oldSteps = SettingsStore.get('setup.finishedSteps', []) as SetupStep[]

const migratedSteps =
  typeof oldSteps[0] !== 'number'
    ? oldSteps
    : oldSteps
        .map((step: SetupStep | number) => {
          if (typeof step !== 'number') return step

          switch (step) {
            case 1:
              return SetupStep.CONNECT
            case 2:
              return SetupStep.SPOILERS
            case 3:
              return SetupStep.DISCORD
            case 4:
              return SetupStep.LOCAL_FILES
            default:
              return null
          }
        })
        .filter(isNotNil)

const initialState: SettingsState = {
  episodeFeedMode: SettingsStore.get('episodeFeedMode', EpisodeFeedMode.QUEUE),
  autoMarkAsPlanning: SettingsStore.get('autoMarkAsPlanning', true),
  useCRUnblocker: SettingsStore.get('useCRUnblocker', true),
  crLocale: SettingsStore.get('crLocale', 'enUS'),
  autoUpdate: SettingsStore.get('autoUpdate', true),
  beta: SettingsStore.get('beta', false),
  autoPlay: SettingsStore.get('autoPlay', true),
  autoMarkWatched: SettingsStore.get('autoMarkWatched', true),
  discord: SettingsStore.get('discord', { ...defaultDiscord }),
  keybindings: SettingsStore.get('keybindings', { ...defaultBindings }),
  spoilers: SettingsStore.get('spoilers', { ...defaultSpoilers }),
  externalPlayers: SettingsStore.get('externalPlayers', { vlc: null }),
  localFilesFolder: SettingsStore.get('localFilesFolder', null),
  mainListPlugin: SettingsStore.get('mainListPlugin', 'anilist'),
  setup: {
    finishedSteps: migratedSteps,
  },
  window: SettingsStore.get('window', {}),
}

SettingsStore.set(initialState)

export const settings = {
  namespaced: true,

  state: { ...initialState },

  getters: {
    getSettings(state: SettingsState) {
      return state
    },

    getEpisodeFeedMode(state: SettingsState) {
      return state.episodeFeedMode
    },

    getShouldAutoPlay(state: SettingsState) {
      return state.autoPlay
    },

    getShouldAutoMarkWatched(state: SettingsState) {
      return state.autoMarkWatched
    },

    getCrunchyrollLocale(state: SettingsState) {
      return state.crLocale
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

    getLocalFilesFolder(state: SettingsState) {
      return state.localFilesFolder
    },

    getHasFinishedSetup(state: SettingsState) {
      return state.setup.finishedSteps.length >= _setupSteps.length
    },

    getNextUnfinishedStep(state: SettingsState) {
      const remainingSteps = _setupSteps.filter(
        i => !state.setup.finishedSteps.includes(i),
      )

      if (!remainingSteps) return null

      return remainingSteps[0]
    },

    getMainListPlugin(state: SettingsState) {
      return state.mainListPlugin
    },
  },

  mutations: {
    setEpisodeFeedMode(state: SettingsState, mode: EpisodeFeedMode) {
      state.episodeFeedMode = mode

      SettingsStore.set('episodeFeedMode', mode)
    },

    setCrunchyrollLocale(state: SettingsState, locale: string) {
      state.crLocale = locale

      SettingsStore.set('crLocale', locale)
    },

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

      SettingsStore.set(`keybindings.${options.key}`, newActions)
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

      const newActions = storedActions.filter(
        newAction => newAction === options.action,
      )

      Vue.set(state.keybindings, options.key, newActions)

      if (newActions.length > 0) {
        SettingsStore.set(`keybindings.${options.key}`, newActions)
      } else {
        SettingsStore.delete(`keybindings.${options.key}`)
      }
    },

    resetKeybindings(state: SettingsState) {
      state.keybindings = { ...defaultBindings }

      SettingsStore.set('keybindings', state.keybindings)
    },

    setSpoiler(
      state: SettingsState,
      payload: {
        path: [keyof SettingsState['spoilers'], string]
        value: boolean
      },
    ) {
      if (!hasKey(state.spoilers[payload.path[0]], payload.path[1])) {
        //eslint-disable-next-line no-console
        return console.error(
          'Tried to set unknown setting: ' + payload.path.join('.'),
        )
      }

      ;(state.spoilers[payload.path[0]] as any)[payload.path[1]] = payload.value

      SettingsStore.set(['spoilers', ...payload.path].join('.'), payload.value)
    },

    setLocalFilesFolder(state: SettingsState, path: string | null) {
      state.localFilesFolder = path

      SettingsStore.set('localFilesFolder', path)
    },

    setVLCPath(state: SettingsState, path: string | null) {
      state.externalPlayers.vlc = path

      SettingsStore.set('externalPlayers', state.externalPlayers)
    },

    setDiscordRichPresence(state: SettingsState, enabled: boolean) {
      if (enabled) {
        ipcRenderer.send(DISCORD_ENABLE_RICH_PRESENCE)
      } else {
        ipcRenderer.send(DISCORD_DISABLE_RICH_PRESENCE)
      }

      state.discord.richPresence = enabled

      SettingsStore.set('discord.richPresence', enabled)
    },

    setSetting(
      state: SettingsState,
      options: {
        setting: keyof SettingsState
        value: SettingsState[typeof options.setting]
      },
    ) {
      if (!hasKey(state, options.setting)) {
        // eslint-disable-next-line no-console
        return console.error('Tried to set unknown setting: ' + options.setting)
      }

      ;(state[options.setting] as any) = options.value

      SettingsStore.set(options.setting, options.value)
    },

    addFinishedStep(state: SettingsState, step: SetupStep) {
      const steps = state.setup.finishedSteps

      if (!steps.includes(step)) {
        steps.push(step)

        SettingsStore.set('setup.finishedSteps', steps)
      }
    },

    removeFinishedStep(state: SettingsState, step: SetupStep) {
      const index = state.setup.finishedSteps.indexOf(step)

      if (index === -1) return

      state.setup.finishedSteps.splice(index, 1)
      SettingsStore.set('setup.finishedSteps', state.setup.finishedSteps)
    },

    setMainListPlugin(
      state: SettingsState,
      service: SettingsState['mainListPlugin'],
    ) {
      state.mainListPlugin = service
      SettingsStore.set('mainListPlugin', service)
    },
  },

  actions: {
    updateMainListPlugin(context: SettingsContext) {
      for (const plugin of window.listPlugins) {
        if (!plugin.isAvailable()) continue

        return setMainListPlugin(context, plugin.service)
      }

      setMainListPlugin(context, null)
    },
  },
}

const { read, commit, dispatch } = getStoreAccessors<SettingsState, RootState>(
  'settings',
)

export const getSettings = read(settings.getters.getSettings)
export const getEpisodeFeedMode = read(settings.getters.getEpisodeFeedMode)
export const getShouldAutoPlay = read(settings.getters.getShouldAutoPlay)
export const getShouldAutoMarkWatched = read(
  settings.getters.getShouldAutoMarkWatched,
)
export const getCrunchyrollLocale = read(settings.getters.getCrunchyrollLocale)
export const getKeybindings = read(settings.getters.getKeybindings)
export const getKeysForAction = read(settings.getters.getKeysForAction)
export const getKeydownHandler = read(settings.getters.getKeydownHandler)
export const getSpoilerSettings = read(settings.getters.getSpoilerSettings)
export const getLocalFilesFolder = read(settings.getters.getLocalFilesFolder)
export const getHasFinishedSetup = read(settings.getters.getHasFinishedSetup)
export const getNextUnfinishedStep = read(
  settings.getters.getNextUnfinishedStep,
)
export const getMainListPlugin = read(settings.getters.getMainListPlugin)

export const setEpisodeFeedMode = commit(settings.mutations.setEpisodeFeedMode)
export const setCrunchyrollLocale = commit(
  settings.mutations.setCrunchyrollLocale,
)
export const addKeybinding = commit(settings.mutations.addKeybinding)
export const removeKeybinding = commit(settings.mutations.removeKeybinding)
export const resetKeybindings = commit(settings.mutations.resetKeybindings)
export const setSpoiler = commit(settings.mutations.setSpoiler)
export const setLocalFilesFolder = commit(
  settings.mutations.setLocalFilesFolder,
)
export const setVLCPath = commit(settings.mutations.setVLCPath)
export const setSetting = commit(settings.mutations.setSetting)
export const setDiscordRichPresence = commit(
  settings.mutations.setDiscordRichPresence,
)
export const addFinishedStep = commit(settings.mutations.addFinishedStep)
export const removeFinishedStep = commit(settings.mutations.removeFinishedStep)
export const setMainListPlugin = commit(settings.mutations.setMainListPlugin)

export const updateMainListPlugin = dispatch(
  settings.actions.updateMainListPlugin,
)
