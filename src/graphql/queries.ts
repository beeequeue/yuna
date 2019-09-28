import { ApolloQueryResult } from 'apollo-client'
import { DollarApollo } from 'vue-apollo/types/vue-apollo'
import { oc } from 'ts-optchain'

import {
  ANILIST_IDS_FROM_MAL_IDS,
  LIST_FILTER_ENTRIES,
  LIST_FILTER_MEDIA,
} from '@/graphql/documents/queries'
import {
  AnilistIdsFromMalIdsQuery,
  AnilistIdsFromMalIdsQueryVariables,
  ListFilterEntriesListEntries,
  ListFilterEntriesQuery,
  ListFilterEntriesQueryVariables,
  ListFilterMediaMedia,
  ListFilterMediaQuery,
  ListFilterMediaQueryVariables,
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

const getAllEntries = async ({ $apollo }: Instance) => {
  const entries: ListFilterEntriesListEntries[] = []

  for (let i = 0; i < 100; i++) {
    const variables: ListFilterEntriesQueryVariables = {
      page: i + 1,
    }
    const { data, errors } = await $apollo.query<ListFilterEntriesQuery>({
      query: LIST_FILTER_ENTRIES,
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
    media?: ListFilterMediaMedia
  }
>

export const getListData = async ({ $apollo, ...rest }: Instance) => {
  const entries: ListData = await getAllEntries({ $apollo, ...rest })

  const idChunks = Array.from({ length: Math.ceil(entries.length / 50) }).map(
    (_, i) => entries.slice(i * 50, (i + 1) * 50).map(prop('mediaId')),
  )

  const promises = idChunks.map(async chunk => {
    const variables: ListFilterMediaQueryVariables = {
      ids: chunk,
    }
    const { data } = await $apollo.query<ListFilterMediaQuery>({
      query: LIST_FILTER_MEDIA,
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
