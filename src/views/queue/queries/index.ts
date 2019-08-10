import { DollarApollo } from 'vue-apollo/types/vue-apollo'

import WATCHING_QUERY from './watching.graphql'
import {
  WatchingQueryQuery,
  WatchingQueryQueryVariables,
} from './watching.types'

import PLANNING_QUERY from './planning.graphql'
import {
  PlanningQueryQuery,
  PlanningQueryQueryVariables,
} from './planning.types'

import PAUSED_QUERY from './paused.graphql'
import { PausedQueryQuery, PausedQueryQueryVariables } from './paused.types'

export const watchingQuery = (apollo: DollarApollo<any>, userId: number) =>
  apollo.query<WatchingQueryQuery>({
    query: WATCHING_QUERY,
    variables: { userId } as WatchingQueryQueryVariables,
    fetchPolicy: 'network-only',
  })

export const planningQuery = (apollo: DollarApollo<any>, userId: number) =>
  apollo.query<PlanningQueryQuery>({
    query: PLANNING_QUERY,
    variables: { userId } as PlanningQueryQueryVariables,
    fetchPolicy: 'network-only',
  })

export const pausedQuery = (apollo: DollarApollo<any>, userId: number) =>
  apollo.query<PausedQueryQuery>({
    query: PAUSED_QUERY,
    variables: { userId } as PausedQueryQueryVariables,
    fetchPolicy: 'network-only',
  })
