import { DollarApollo } from 'vue-apollo/types/vue-apollo'

import { PausedQueryQuery, PlanningQueryQuery, SearchQueryQuery, WatchingQueryQuery } from '@/graphql/types'

import PAUSED_QUERY from './PausedQuery.graphql'
import PLANNING_QUERY from './PlanningQuery.graphql'
import SEARCH_QUERY from './SearchQuery.graphql'
import WATCHING_QUERY from './WatchingQuery.graphql'

export const searchQuery = (apollo: DollarApollo<any>, search: string) =>
  apollo.query<SearchQueryQuery>({
    query: SEARCH_QUERY,
    variables: { search },
  })

export const watchingQuery = (apollo: DollarApollo<any>, userId: number) =>
  apollo.query<WatchingQueryQuery>({
    query: WATCHING_QUERY,
    variables: { userId },
    fetchPolicy: 'network-only',
  })

export const planningQuery = (apollo: DollarApollo<any>, userId: number) =>
  apollo.query<PlanningQueryQuery>({
    query: PLANNING_QUERY,
    variables: { userId },
    fetchPolicy: 'network-only',
  })

export const pausedQuery = (apollo: DollarApollo<any>, userId: number) =>
  apollo.query<PausedQueryQuery>({
    query: PAUSED_QUERY,
    variables: { userId },
    fetchPolicy: 'network-only',
  })
