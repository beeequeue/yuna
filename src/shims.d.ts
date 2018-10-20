declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module '*.svg' {
  import Vue from 'vue'
  export default Vue
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.graphql' {
  const content: any
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

declare interface Window {
  initialLogin: boolean
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

  const plugin: PluginObject<{}>

  export = plugin
}
