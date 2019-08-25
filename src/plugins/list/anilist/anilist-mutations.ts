import gql from 'graphql-tag'
import { ANILIST_LIST_ENTRY_FRAGMENT } from '@/graphql/fragments'

export const SET_SCORE = gql`
  mutation SetScore($mediaId: Int, $score: Int) {
    SaveMediaListEntry(mediaId: $mediaId, scoreRaw: $score) {
      ...AniListEntry
    }
  }

  ${ANILIST_LIST_ENTRY_FRAGMENT}
`
export const SET_STATUS = gql`
  mutation SetStatus($mediaId: Int, $status: MediaListStatus) {
    SaveMediaListEntry(mediaId: $mediaId, status: $status) {
      ...AniListEntry
    }
  }

  ${ANILIST_LIST_ENTRY_FRAGMENT}
`
export const SET_PROGRESS = gql`
  mutation SetProgress($mediaId: Int, $progress: Int) {
    SaveMediaListEntry(mediaId: $mediaId, progress: $progress) {
      ...AniListEntry
    }
  }

  ${ANILIST_LIST_ENTRY_FRAGMENT}
`
export const CREATE_ENTRY = gql`
  mutation CreateEntry($mediaId: Int) {
    SaveMediaListEntry(mediaId: $mediaId, status: PLANNING) {
      ...AniListEntry
    }
  }

  ${ANILIST_LIST_ENTRY_FRAGMENT}
`

export const ANILIST_START_REWATCHING = gql`
  mutation AnilistStartRewatching($mediaId: Int) {
    SaveMediaListEntry(mediaId: $mediaId, status: REPEATING, progress: 0) {
      ...AniListEntry
    }
  }

  ${ANILIST_LIST_ENTRY_FRAGMENT}
`

export const DELETE_ENTRY = gql`
  mutation DeleteEntry($id: Int!) {
    DeleteMediaListEntry(id: $id) {
      deleted
    }
  }
`
