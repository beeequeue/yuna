import { ApolloClient } from 'apollo-client'
import { oc } from 'ts-optchain'

import { MAL_ID_FROM_ANILIST_ID } from '@/graphql/documents/queries'
import {
  MalIdFromAnilistIdQuery,
  MalIdFromAnilistIdQueryVariables,
  Media,
} from '@/graphql/types'
import { Simkl } from '@/lib/simkl'
import { isNil } from '@/utils'

type Proxy = { cache: RealProxy; client: ApolloClient<any> }

const getMalId = async (client: ApolloClient<any>, mediaId: number) => {
  const variables: MalIdFromAnilistIdQueryVariables = {
    mediaId,
  }
  const result = await client.query<MalIdFromAnilistIdQuery>({
    fetchPolicy: 'cache-first',
    query: MAL_ID_FROM_ANILIST_ID,
    variables,
  })

  return oc(result.data).Media.idMal(null)
}

export const scoreSimklResolver = async (
  media: Partial<Media>,
  _vars: null,
  { client }: Proxy,
): Promise<number | null> => {
  let malId = oc(media).idMal()

  if (isNil(malId)) {
    if (isNil(media.id)) {
      // eslint-disable-next-line no-console
      console.warn('Got no Media ID when looking for Simkl Link')
      return null
    }

    malId = await getMalId(client, media.id)
  }

  if (isNil(malId)) return null

  try {
    return Simkl.getRating(malId)
  } catch (err) {
    return null
  }
}

export const linkSimklResolver = async (
  media: Partial<Media>,
  _vars: null,
  { client }: Proxy,
): Promise<string | null> => {
  let malId = oc(media).idMal()

  if (isNil(malId)) {
    if (isNil(media.id)) {
      // eslint-disable-next-line no-console
      console.warn('Got no Media ID when looking for Simkl Link')
      return null
    }

    malId = await getMalId(client, media.id)
  }

  if (isNil(malId)) return null

  return Simkl.getLink(malId)
}

export const simklResolvers = {
  Media: {
    scoreSimkl: scoreSimklResolver,
    linkSimkl: linkSimklResolver,
  },
}
