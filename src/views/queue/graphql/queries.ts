import { DollarApollo } from 'vue-apollo/types/vue-apollo'

import {
  PAUSED_QUERY,
  PLANNING_QUERY,
  WATCHING_QUERY,
} from '@/views/queue/graphql/documents'
import {
  PausedQueryQuery,
  PlanningQueryQuery,
  WatchingQueryQuery,
} from '@/graphql/types'

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
