import { DocumentNode } from 'graphql'
import { ApolloQueryResult } from 'apollo-client'
import { DollarApollo } from 'vue-apollo/types/vue-apollo'
import { oc } from 'ts-optchain'

import { ArmServer } from '@/lib/arm-server'
import {
  ANILIST_IDS_FROM_MAL_IDS,
  LIST_VIEW_QUERY,
} from '@/graphql/documents/queries'
import {
  AnilistIdsFromMalIdsQuery,
  AnilistIdsFromMalIdsQueryVariables,
  ListViewListEntries,
  ListViewQuery,
  ListViewQueryVariables,
} from '@/graphql/types'
import { Instance } from '@/types'
import { isNil } from '@/utils'

type BaseResult = {
  Page: null | {
    pageInfo: null | {
      lastPage: number | null
    }
  }
}

type FetchAllPagesOptions<V extends { page: number }> = {
  apollo: DollarApollo<any>
  query: DocumentNode
  variables: Omit<V, 'page'>
}

const fetchAllPages = async <R extends BaseResult, V extends { page: number }>({
  apollo,
  query,
  variables,
}: FetchAllPagesOptions<V>) => {
  const firstResponse = await apollo.query<R>({
    query,
    variables: {
      ...variables,
      page: 1,
    },
  })

  const pagesLeft = oc(firstResponse).data.Page.pageInfo.lastPage(1) - 1

  const promises: Promise<ApolloQueryResult<R>>[] = []

  for (let i = 0; i < pagesLeft; i++) {
    promises.push(
      apollo.query<R>({
        query,
        variables: {
          ...variables,
          page: i + 2, // 1 for first page loaded already and 1 for index
        },
      }),
    )
  }

  const restOfResponses = await Promise.all(promises)

  return [firstResponse, ...restOfResponses]
}

type MapResult = { [malId: number]: number }

export const getAnilistIdsFromMalIds = async (
  apollo: DollarApollo<any>,
  malIds: number[],
): Promise<MapResult> => {
  const armResponse = await ArmServer.batchGetIds(
    malIds.map(id => ({ myanimelist: id })),
  )

  const armResults = armResponse
    .filter(
      item => !isNil(item) && !isNil(item.anilist) && !isNil(item.myanimelist),
    )
    .reduce(
      (obj, item) => ({
        ...obj,
        [item!.myanimelist!]: item!.anilist!,
      }),
      {} as MapResult,
    )

  const idsLeft = malIds.filter(
    id =>
      !Object.keys(armResults)
        .map(Number)
        .includes(id),
  )

  const responses = await fetchAllPages<
    AnilistIdsFromMalIdsQuery,
    AnilistIdsFromMalIdsQueryVariables
  >({
    apollo,
    query: ANILIST_IDS_FROM_MAL_IDS,
    variables: {
      malIds: idsLeft,
    },
  })

  const anilistResults = responses
    .map(data => oc(data).data.Page.media([]))
    .flat()
    .reduce(
      (obj, item) => ({
        ...obj,
        [item!.idMal!]: item!.id!,
      }),
      {} as MapResult,
    )

  return {
    ...armResults,
    ...anilistResults,
  }
}

export const getALofOfEntries = async (
  { $apollo }: Instance,
  amount: number,
) => {
  const entries: ListViewListEntries[] = []
  const fiveHundreds = Math.floor(amount / 500)

  for (let i = 0; i < fiveHundreds; i++) {
    const variables: ListViewQueryVariables = {
      page: i + 1,
    }
    const { data, errors } = await $apollo.query<ListViewQuery>({
      query: LIST_VIEW_QUERY,
      variables,
      errorPolicy: 'all',
    })

    if (errors || oc(data).ListEntries([]).length < 1) break

    entries.push(...data.ListEntries)
  }

  return entries
}
