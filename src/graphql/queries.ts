import { ApolloQueryResult } from 'apollo-client'
import { DollarApollo } from 'vue-apollo/types/vue-apollo'
import { oc } from 'ts-optchain'

import {
  ANILIST_IDS_FROM_MAL_IDS,
  LIST_MEDIA_QUERY,
  LIST_VIEW_QUERY,
} from '@/graphql/documents/queries'
import {
  AnilistIdsFromMalIdsQuery,
  AnilistIdsFromMalIdsQueryVariables,
  ListMediaMedia,
  ListMediaQuery,
  ListMediaQueryVariables,
  ListViewListEntries,
  ListViewQuery,
  ListViewQueryVariables,
} from '@/graphql/types'
import { Instance } from '@/types'
import { isNil, isNotNil, prop } from '@/utils'

export const getAnilistIdsFromMalIds = async (
  apollo: DollarApollo<any>,
  malIds: number[],
) => {
  const fifties = Math.ceil(malIds.length / 50)

  const responses: ApolloQueryResult<
    AnilistIdsFromMalIdsQuery
  >[] = await Promise.all(
    Array.from({ length: fifties }).map((_, i) => {
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

export const getAllEntries = async ({ $apollo }: Instance) => {
  const entries: ListViewListEntries[] = []

  for (let i = 0; i < 100; i++) {
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

type ListData = Array<
  PromiseReturnType<typeof getAllEntries>[number] & {
    media?: ListMediaMedia
  }
>

export const getListData = async ({ $apollo, ...rest }: Instance) => {
  const entries: ListData = await getAllEntries({ $apollo, ...rest })

  const idChunks = Array.from({ length: Math.ceil(entries.length / 50) }).map(
    (_, i) => entries.slice(i * 50, (i + 1) * 50).map(prop('mediaId')),
  )

  const promises = idChunks.map(async chunk => {
    const variables: ListMediaQueryVariables = {
      ids: chunk,
    }
    const { data } = await $apollo.query<ListMediaQuery>({
      query: LIST_MEDIA_QUERY,
      variables,
    })

    oc(data)
      .Page.media([])
      .filter(isNotNil)
      .forEach(media => {
        const entry = entries.find(entry => entry.mediaId === media.id)

        if (isNil(entry)) return

        entry.media = media
      })
  })

  await Promise.all(promises)

  return entries
}
