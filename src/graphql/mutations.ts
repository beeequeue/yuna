import gql from 'graphql-tag'
import { LIST_ENTRY_FRAGMENT } from '@/graphql/fragments'

export const ADD_TO_LIST = gql`
  mutation AddToList($anilistId: Int!) {
    AddToList(anilistId: $anilistId) @client {
      ...ListEntry
    }
  }

  ${LIST_ENTRY_FRAGMENT}
`

export const DELETE_FROM_LIST = gql`
  mutation DeleteFromList($anilistId: Int!) {
    DeleteFromList(anilistId: $anilistId) @client
  }
`
