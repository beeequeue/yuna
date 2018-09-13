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
