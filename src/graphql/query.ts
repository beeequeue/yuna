import { DollarApollo } from 'vue-apollo/types/vue-apollo'

import SEARCH_QUERY from './SearchQuery.graphql'
import { SearchQuery } from './SearchQuery'
import WATCHING_QUERY from './WatchingQuery.graphql'
import { WatchingQuery } from './WatchingQuery'

export const searchQuery = (apollo: DollarApollo<any>, search: string) =>
  apollo.query<SearchQuery>({
    query: SEARCH_QUERY,
    variables: { search },
  })

export const watchingQuery = (apollo: DollarApollo<any>, userId: number) =>
  apollo.query<WatchingQuery>({
    query: WATCHING_QUERY,
    variables: { userId },
  })
