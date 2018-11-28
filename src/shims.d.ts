declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module '*.svg' {
  import Vue from 'vue'
  export default Vue
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.graphql' {
  import { DocumentNode } from 'graphql'
  const content: DocumentNode
  export default content
}

declare module 'superagent/superagent' {
  import request from 'superagent'
  export = request
}

declare module 'vuedraggable' {
  import Vue from 'vue'
  export default Vue
}

declare module 'electron-util' {
  import { App, BrowserWindow } from 'electron'

  export const api: { app: App }

  export const is: {
    macos: boolean
    linux: boolean
    windows: boolean
    main: boolean
    renderer: boolean
    development: boolean
    usingAsar: boolean
    macAppStore: boolean
    windowsStore: boolean
  }

  export const electronVersion: string
  export const chromeVersion: string

  export const platform: <F1, F2, F3>(
    opts: { macos?: F1; windows?: F2; linux?: F3 },
  ) => F1 | F2 | F3

  export const isFirstAppLaunch: () => boolean

  export const activeWindow: () => BrowserWindow
}

declare interface Window {
  initialLogin: boolean
}

declare interface InputEvent<
  E extends HTMLInputElement | HTMLSelectElement = HTMLInputElement
> extends Event {
  currentTarget: E
  target: E
}

declare module 'vue-cli-plugin-apollo/graphql-client' {
  export const createApolloClient: (
    options: any,
  ) => {
    apolloClient: any
    wsClient: any
    stateLink: any
  }

  export const restartWebsockets: (a: any) => void
}

declare module '*/package.json' {
  const content: {
    version: string
    [key: string]: any
  }
  export = content
}

declare module 'vue-notifications' {
  import { PluginFunction } from 'vue'

  export type NotificationTypes = 'success' | 'info' | 'warning' | 'error'

  export interface NotificationFunctionOptions<T> {
    title: string
    message: string
    type: T
    timeout?: number
    consoleMessage?: string
  }

  export interface NotificationPluginOptions {
    type?: NotificationTypes
    timeout?: number
    success?: (options: NotificationFunctionOptions<'success'>) => void
    info?: (options: NotificationFunctionOptions<'info'>) => void
    warning?: (options: NotificationFunctionOptions<'warning'>) => void
    error?: (options: NotificationFunctionOptions<'error'>) => void
  }

  const plugin: PluginFunction<NotificationPluginOptions>

  export default plugin
}

declare module 'v-tooltip' {
  import { PluginObject } from 'vue'

  type Triggers =
    | 'hover'
    | 'click'
    | 'focus'
    | 'hover click'
    | 'hover focus'
    | 'click focus'
    | 'click hover focus'
    | 'manual'

  export interface TooltipSettings {
    content: string
    loadingContent?: string
    classes?: string[]
    targetClasses?: string[]
    loadingClass?: string[]
    html?: boolean
    show?: boolean
    trigger?: Triggers
    autoHide?: boolean
    hideOnTargetClick?: boolean
    delay?:
      | number
      | {
          show: number
          hide: number
        }
    offset?: number
    container?: string
    arrowSelector?: string
    innerSelector?: string
    popperOptions?: any
  }

  const plugin: PluginObject<{}>

  export default plugin
}
