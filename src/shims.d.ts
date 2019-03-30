declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

declare interface Level {
  attrs: {
    BANDWIDTH: number
    CODECS: string
    'FRAME-RATE': string
    'PROGRAM-ID': string
    RESOLUTION: string
  }
  bitrate: number
  details: {}
  name?: string
  height: number
  width: number
  level: number
  audioCodec: string
  videoCodec: string
  unknownCodecs: any[]
  urls: string[]
  urlId: number
  fragmentError: boolean
  loadError: number
}

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

declare module 'superagent/dist/superagent' {
  import request from 'superagent'
  export = request
}

declare module 'vue-smooth-dnd' {
  import Vue, { VueConstructor } from 'vue'

  export const Container: VueConstructor<Vue>
  export const Draggable: VueConstructor<Vue>
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
