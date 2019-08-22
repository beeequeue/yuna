import gql from 'graphql-tag'

import { LIST_ENTRY_FRAGMENT } from './fragments'

export const SET_SCORE = gql`
  mutation SetScore($id: Int, $score: Int) {
    SaveMediaListEntry(id: $id, scoreRaw: $score) {
      ...ListEntry
    }
  }

  ${LIST_ENTRY_FRAGMENT}
`

export const SET_STATUS = gql`
  mutation SetStatus($id: Int, $status: MediaListStatus) {
    SaveMediaListEntry(id: $id, status: $status) {
      ...ListEntry
    }
  }

  ${LIST_ENTRY_FRAGMENT}
`
