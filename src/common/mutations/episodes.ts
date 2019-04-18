import gql from 'graphql-tag'

import UPDATE_PROGRESS_MUTATION from '@/graphql/UpdateProgressMutation.graphql'
import {
  MediaListStatus,
  UpdateProgressMutationMutation,
} from '@/graphql/types'

import { Instance } from '@/types'
import { isNil } from '@/utils'
import {
  EpisodeMutationObject,
  refetchListQuery,
  writeEpisodeProgressToCache,
} from '@/utils/cache'

interface ListEntry {
  id: number
  status: MediaListStatus
  repeat: number
}

export const setProgress = async (
  { $apollo, $store }: Instance,
  options: EpisodeMutationObject,
) => {
  const progress = options.episodeNumber
  let listEntry: ListEntry | null = null

  try {
    listEntry = $apollo.provider.defaultClient.cache.readQuery({
      query: gql`
        query ProgressListEntry($id: Int!) {
          listEntry: MediaList(mediaId: $id) {
            id
            repeat
            status
          }
        }
      `,
      variables: {
        id: options.animeId,
      },
    })
  } catch (e) {
    /* no-op */
  }

  if (isNil(listEntry)) {
    throw new Error('Tried to update progress of show not in List!')
  }

  return $apollo.mutate<UpdateProgressMutationMutation>({
    mutation: UPDATE_PROGRESS_MUTATION,
    variables: { id: listEntry.id, progress },
    optimisticResponse: {
      SaveMediaListEntry: {
        __typename: 'MediaList',
        id: listEntry.id,
        progress,
        repeat: listEntry.repeat || 0,
        status: listEntry.status || MediaListStatus.Current,
      },
    } as UpdateProgressMutationMutation,
    refetchQueries: refetchListQuery($store),
    update: cache => {
      writeEpisodeProgressToCache(cache, options, progress)
    },
  })
}
