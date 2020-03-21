/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare type UnPromisify<T> = T extends Promise<infer R> ? R : T

declare type PromiseReturnType<T> = T extends (...a: any[]) => Promise<infer R>
  ? R
  : T

declare type GlobalFetch = {
  fetch: typeof window.fetch
}

declare type CSSProps = Partial<
  Omit<
    CSSStyleDeclaration,
    | 'getPropertyPriority'
    | 'getPropertyValue'
    | 'item'
    | 'removeProperty'
    | 'setProperty'
  >
>

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

declare module '!url-loader!' {
  const str: string
  export default str
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

// @ts-ignore
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
  import { ApolloClientOptions, Resolvers } from 'apollo-client'
  import { ApolloLink, DocumentNode } from 'apollo-link'
  import { FetchOptions } from 'apollo-link-http'
  import { ClientStateConfig } from 'apollo-link-state'
  import { ApolloCache } from 'apollo-cache'
  import { InMemoryCacheConfig } from 'apollo-cache-inmemory'

  interface CreateClientOptions {
    /** URL to the HTTP API */
    httpEndpoint: string
    /** Url to the Websocket API; set `null` to disable websockets */
    wsEndpoint?: string | null
    /** Token used in localstorage */
    tokenName?: string
    /** Enable this if you use Query persisting with Apollo Engine */
    persisting?: boolean
    /** Is currently Server-Side Rendering or not */
    ssr?: boolean
    /** Only use Websocket for all requests (including queries and mutations) */
    websocketsOnly?: boolean
    /**
     * Custom starting link.
     * If you want to replace the default HttpLink , set `defaultHttpLink` to false
     */
    link?: ApolloLink
    /**
     * If true, add the default HttpLink.
     * Disable it if you want to replace it with a terminating link using `link` option.
     */
    defaultHttpLink?: boolean
    /** Options for the default HttpLink */
    httpLinkOptions?: FetchOptions
    /** Custom Apollo cache implementation (default is apollo-cache-inmemory) */
    cache?: ApolloCache<any>
    /** Options for the default cache */
    inMemoryCacheOptions?: InMemoryCacheConfig
    /** Additional Apollo client options */
    apollo?: ApolloClientOptions<any>
    /** apollo-link-state options */
    clientState?: ClientStateConfig
    /** Function returning Authorization header token */
    getAuth?: (tokenName?: string) => string

    typeDefs?: DocumentNode
    resolvers?: Resolvers
  }

  export const createApolloClient: (
    options: CreateClientOptions,
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

declare module 'vue-virtual-scroller' {
  import { PluginObject } from 'vue'
  import { ThisTypedComponentOptionsWithArrayProps } from 'vue/types/options'

  export interface RecycleScrollerProps {
    items: any[]
    direction?: 'vertical' | 'horizontal'
    itemSize?: number
    minItemSize?: number
    sizeField?: string
    typeField?: string
    keyField?: string
    pageMode?: boolean
    prerender?: boolean
    buffer?: number
    emitUpdate?: boolean
  }

  export const RecycleScroller: ThisTypedComponentOptionsWithArrayProps<
    any,
    any,
    any,
    any,
    keyof RecycleScrollerProps
  >

  const plugin: PluginObject<{}>

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
    placement?:
      | 'auto'
      | 'auto-start'
      | 'auto-end'
      | 'top'
      | 'top-start'
      | 'top-end'
      | 'right'
      | 'right-start'
      | 'right-end'
      | 'bottom'
      | 'bottom-start'
      | 'bottom-end'
      | 'left'
      | 'left-start'
      | 'left-end'
    offset?: number
    container?: string
    arrowSelector?: string
    innerSelector?: string
    popperOptions?: any
  }

  const plugin: PluginObject<{}>

  export default plugin
}

declare module 'electron-timber' {
  const content: {
    log: (...values: any[]) => void
    warn: (...values: any[]) => void
    error: (...values: any[]) => void
  }
  export = content
}
