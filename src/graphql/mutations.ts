import gql from 'graphql-tag'
import { ANILIST_LIST_ENTRY_FRAGMENT } from '@/graphql/fragments'

export const ADD_TO_LIST = gql`
  mutation AddToList($anilistId: Int!) {
    AddToList(anilistId: $anilistId) {
      id
      mediaId
      progress
      score
      status
      rewatched
    }
  }

  ${ANILIST_LIST_ENTRY_FRAGMENT}
`
