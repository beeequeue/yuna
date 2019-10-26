import Vue from 'vue'
import VueApollo, { ApolloProvider } from 'vue-apollo'
import {
  createApolloClient,
  CreateClientOptions,
} from 'vue-cli-plugin-apollo/graphql-client'
import { Store } from 'vuex'
import {
  IntrospectionFragmentMatcher,
  defaultDataIdFromObject,
} from 'apollo-cache-inmemory'
import Bottleneck from 'bottleneck'
import { captureException } from '@sentry/browser'

import introspectionResult from '@/graphql/introspection-result'
import { resolvers } from '@/graphql/resolvers'
import { EpisodeListEpisodes, ListEntry } from '@/graphql/types'
import { userStore } from '@/lib/user'
import { getEpisodeCacheKey, isOfTypename } from '@/utils'
import {
  getAnilistRequestsUntilLimiting,
  setAnilistRequests,
} from '@/state/app'

// Install the vue plugin
Vue.use(VueApollo)

// Http endpoint
const httpEndpoint = 'https://graphql.anilist.co'

const dataIdFromObject = (obj: { __typename?: string; [key: string]: any }) => {
  // Episode
  if (isOfTypename<EpisodeListEpisodes>(obj, 'Episode')) {
    return getEpisodeCacheKey(obj)
  }

  // ListEntry
  if (isOfTypename<ListEntry>(obj, 'ListEntry')) {
    return `ListEntry:${obj.mediaId}`
  }

  if (obj.__typename) {
    if (obj.id !== undefined) {
      return `${obj.__typename}:${obj.id}`
    }
    if (obj._id !== undefined) {
      return `${obj.__typename}:${obj._id}`
    }
  }

  return defaultDataIdFromObject(obj)
}

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: introspectionResult,
})

const limiter = new Bottleneck({
  reservoir: 85,
  reservoirRefreshAmount: 85,
  reservoirRefreshInterval: 60 * 1000,
})

const limitedFetch = limiter.wrap(window.fetch)

// Config
const options: CreateClientOptions = {
  // You can use `https` for secure connection (recommended in production)
  httpEndpoint,

  persisting: false,
  ssr: false,
  websocketsOnly: false,
  wsEndpoint: null,

  // Override the way the Authorization header is set
  getAuth: () => userStore.get('anilist.token'),

  // Fetch override
  httpLinkOptions: {
    fetch: limitedFetch,
  },

  // Cache Options
  inMemoryCacheOptions: {
    dataIdFromObject,
    fragmentMatcher,
  },

  // Client local data
  resolvers,
}

// Call this in the Vue app file
export const createProvider = (store: Store<any>) => {
  // Create apollo client
  const { apolloClient, wsClient } = createApolloClient(options)
  apolloClient.wsClient = wsClient

  setInterval(async () => {
    const requests = (await limiter.currentReservoir()) || 60

    const savedRequests = getAnilistRequestsUntilLimiting(store)

    if (requests === savedRequests) return

    setAnilistRequests(store, requests)
  }, 1000)

  // Create vue apollo provider
  const apolloProvider = new ApolloProvider({
    defaultClient: apolloClient,
    defaultOptions: {
      $query: {
        fetchPolicy: 'cache-first',
      },
    },
    errorHandler(error) {
      if (process.env.NODE_ENV === 'production') {
        captureException(error)
      }

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
