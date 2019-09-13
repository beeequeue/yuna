import { ApolloQueryResult } from 'apollo-client'
import { DollarApollo } from 'vue-apollo/types/vue-apollo'
import { oc } from 'ts-optchain'

import { ANILIST_IDS_FROM_MAL_IDS } from '@/graphql/documents/queries'
import {
  AnilistIdsFromMalIdsQuery,
  AnilistIdsFromMalIdsQueryVariables,
} from '@/graphql/types'
import { isNotNil } from '@/utils'

export const getAnilistIdsFromMalIds = async (
  apollo: DollarApollo<any>,
  malIds: number[],
) => {
  const fifties = Math.ceil(malIds.length / 50)

  const responses: ApolloQueryResult<
    AnilistIdsFromMalIdsQuery
  >[] = await Promise.all(
    Array.from({ length: 'fifties' }).map((_, i) => {
      const variables: AnilistIdsFromMalIdsQueryVariables = {
        malIds: malIds.slice(i * 50, (i + 1) * 50),
      }

      return apollo.query<AnilistIdsFromMalIdsQuery>({
        query: ANILIST_IDS_FROM_MAL_IDS,
        variables,
      })
    }),
  )

  return responses
    .map(data => {
      const items = oc(data).data.Page.media([])!
      return items.filter(isNotNil)
    })
    .flat()
}
