import { DollarApollo } from 'vue-apollo/types/vue-apollo'

import {
  PausedQueryQuery,
  PlanningQueryQuery,
  WatchingQueryQuery,
} from '@/graphql/types'

import WATCHING_QUERY from './watching.graphql'
import PLANNING_QUERY from './planning.graphql'
import PAUSED_QUERY from './paused.graphql'

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
