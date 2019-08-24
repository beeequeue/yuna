import gql from 'graphql-tag'
import { LIST_ENTRY_FRAGMENT } from '@/graphql/fragments'

export const SET_SCORE = gql`
  mutation SetScore($mediaId: Int, $score: Int) {
    SaveMediaListEntry(mediaId: $mediaId, scoreRaw: $score) {
      ...ListEntry
    }
  }

  ${LIST_ENTRY_FRAGMENT}
`
export const SET_STATUS = gql`
  mutation SetStatus($mediaId: Int, $status: MediaListStatus) {
    SaveMediaListEntry(mediaId: $mediaId, status: $status) {
      ...ListEntry
    }
  }

  ${LIST_ENTRY_FRAGMENT}
`
export const SET_PROGRESS = gql`
  mutation UpdateProgress($mediaId: Int, $progress: Int) {
    SaveMediaListEntry(mediaId: $mediaId, progress: $progress) {
      ...ListEntry
    }
  }

  ${LIST_ENTRY_FRAGMENT}
`
export const CREATE_ENTRY = gql`
  mutation CreateEntry($mediaId: Int, $status: MediaListStatus) {
    SaveMediaListEntry(mediaId: $mediaId, status: $status) {
      ...ListEntry
    }
  }

  ${LIST_ENTRY_FRAGMENT}
`
export const START_REWATCHING = gql`
  mutation Rewatch($mediaId: Int) {
    SaveMediaListEntry(mediaId: $mediaId, status: REPEATING, progress: 0) {
      ...ListEntry
    }
  }

  ${LIST_ENTRY_FRAGMENT}
`
export const DELETE_ENTRY = gql`
  mutation DeleteEntry($id: Int!) {
    DeleteMediaListEntry(id: $id) {
      deleted
    }
  }
`
