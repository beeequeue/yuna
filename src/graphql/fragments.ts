import gql from 'graphql-tag'

export const LIST_ENTRY_FRAGMENT = gql`
  fragment ListEntry on MediaList {
    id
    mediaId
    score(format: POINT_100)
    progress
    status
    repeat
  }
`
