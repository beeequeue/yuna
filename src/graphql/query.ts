import { DollarApollo } from 'vue-apollo/types/vue-apollo'

import { PausedQuery } from './PausedQuery'
import PAUSED_QUERY from './PausedQuery.graphql'
import { PlanningQuery } from './PlanningQuery'
import PLANNING_QUERY from './PlanningQuery.graphql'
import { SearchQuery } from './SearchQuery'
import SEARCH_QUERY from './SearchQuery.graphql'
import { WatchingQuery } from './WatchingQuery'
import WATCHING_QUERY from './WatchingQuery.graphql'

export const searchQuery = (apollo: DollarApollo<any>, search: string) =>
  apollo.query<SearchQuery>({
    query: SEARCH_QUERY,
    variables: { search },
  })

export const watchingQuery = (apollo: DollarApollo<any>, userId: number) =>
  apollo.query<WatchingQuery>({
    query: WATCHING_QUERY,
    variables: { userId },
    fetchPolicy: 'network-only',
  })

export const planningQuery = (apollo: DollarApollo<any>, userId: number) =>
  apollo.query<PlanningQuery>({
    query: PLANNING_QUERY,
    variables: { userId },
    fetchPolicy: 'network-only',
  })

export const pausedQuery = (apollo: DollarApollo<any>, userId: number) =>
  apollo.query<PausedQuery>({
    query: PAUSED_QUERY,
    variables: { userId },
    fetchPolicy: 'network-only',
  })
