import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { createApolloClient } from 'vue-cli-plugin-apollo/graphql-client'

import { resolvers } from '@/graphql/resolvers'
import { EpisodeListEpisodes } from '@/graphql/types'
import { userStore } from '@/lib/user'
import { getEpisodeCacheKey, isOfTypename } from '@/utils'

// Install the vue plugin
Vue.use(VueApollo)

const AUTH_TOKEN = 'apollo-token'

// Http endpoint
const httpEndpoint = 'https://graphql.anilist.co'
// Files URL root
export const filesRoot =
  process.env.VUE_APP_FILES_ROOT ||
  httpEndpoint.substr(0, httpEndpoint.indexOf('/graphql'))

Vue.prototype.$filesRoot = filesRoot

const dataIdFromObject = (obj: any) => {
  // Episode
  if (isOfTypename<EpisodeListEpisodes>(obj, 'Episode')) {
    return getEpisodeCacheKey(obj)
  }

  if (obj.__typename) {
    if (obj.id !== undefined) {
      return `${obj.__typename}:${obj.id}`
    }
    if (obj._id !== undefined) {
      return `${obj.__typename}:${obj._id}`
    }
  }

  return null
}

// Config
const options = {
  // You can use `https` for secure connection (recommended in production)
  httpEndpoint,

  // Enable Automatic Query persisting with Apollo Engine
  persisting: false,

  // Is being rendered on the server?
  ssr: false,

  // LocalStorage token
  tokenName: AUTH_TOKEN,

  // Use websockets for everything (no HTTP)
  // You need to pass a `wsEndpoint` for this to work
  websocketsOnly: false,

  // You can use `wss` for secure connection (recommended in production)
  // Use `null` to disable subscriptions
  wsEndpoint: null,

  // Override the way the Authorization header is set
  getAuth: () => userStore.get('anilist.token'),

  // Cache Options
  inMemoryCacheOptions: {
    dataIdFromObject,
  },

  // Client local data
  resolvers,
}

// Call this in the Vue app file
export function createProvider() {
  // Create apollo client
  const { apolloClient, wsClient } = createApolloClient(options)
  apolloClient.wsClient = wsClient

  // Create vue apollo provider
  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
    defaultOptions: {
      $query: {
        fetchPolicy: 'cache-first',
      },
    },
    errorHandler(error) {
      // eslint-disable-next-line no-console
      console.log(
        '%cError',
        'background: red; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
        error.message,
      )
    },
  })

  return apolloProvider
}
