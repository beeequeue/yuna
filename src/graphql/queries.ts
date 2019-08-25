import gql from 'graphql-tag'

export const DELETE_FROM_LIST_ID = gql`
  query DeleteFromListId($mediaId: Int!, $userId: Int!) {
    MediaList(userId: $userId, mediaId: $mediaId) {
      id
    }
  }
`
