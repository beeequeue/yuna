import gql from 'graphql-tag'

export const LIST_ENTRY_FRAGMENT = gql`
  fragment ListEntry on ListEntry {
    id
    mediaId
    score
    progress
    status
    rewatched
  }
`

export const MEDIA_LIST_ENTRY_FRAGMENT = gql`
  fragment MediaListEntry on Media {
    listEntry {
      ...ListEntry
    }
  }

  ${LIST_ENTRY_FRAGMENT}
`

MEDIA_LIST_ENTRY_FRAGMENT.name = 'MediaListEntry'

export const ANILIST_LIST_ENTRY_FRAGMENT = gql`
  fragment AniListEntry on MediaList {
    id
    mediaId
    score(format: POINT_100)
    progress
    status
    repeat
  }
`
