import gql from 'graphql-tag'
import { ANILIST_LIST_ENTRY_FRAGMENT } from '@/graphql/documents/fragments'

export const ANILIST_SET_SCORE = gql`
  mutation AnilistSetScore($mediaId: Int, $score: Int) {
    SaveMediaListEntry(mediaId: $mediaId, scoreRaw: $score) {
      ...AniListEntry
    }
  }

  ${ANILIST_LIST_ENTRY_FRAGMENT}
`
export const ANILIST_SET_STATUS = gql`
  mutation AnilistSetStatus($mediaId: Int, $status: MediaListStatus) {
    SaveMediaListEntry(mediaId: $mediaId, status: $status) {
      ...AniListEntry
    }
  }

  ${ANILIST_LIST_ENTRY_FRAGMENT}
`
export const ANILIST_SET_PROGRESS = gql`
  mutation AnilistSetProgress($mediaId: Int, $progress: Int) {
    SaveMediaListEntry(mediaId: $mediaId, progress: $progress) {
      ...AniListEntry
    }
  }

  ${ANILIST_LIST_ENTRY_FRAGMENT}
`
export const ANILIST_CREATE_ENTRY = gql`
  mutation AnilistCreateEntry($mediaId: Int) {
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

export const ANILIST_DELETE_ENTRY = gql`
  mutation AnilistDeleteEntry($id: Int!) {
    DeleteMediaListEntry(id: $id) {
      deleted
    }
  }
`
