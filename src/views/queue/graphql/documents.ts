import gql from 'graphql-tag'

export const QUEUE_QUERY = gql`
  query Queue($ids: [Int!]!) {
    queue: Page {
      anime: media(id_in: $ids, type: ANIME) {
        id
        idMal
        title {
          userPreferred
        }
        episodes
        status
        siteUrl
        bannerImage
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
        externalLinks {
          site
          url
        }
        listEntry @client {
          id
          progress
          status
          rewatched
          score
        }
      }
    }
  }
`

export const IMPORT_QUERY = gql`
  query Import(
    $status: MediaListStatus!
    $useExtraStatus: Boolean!
    $extraStatus: MediaListStatus
  ) {
    ListEntries(status: $status) @client {
      id
      mediaId
      status
    }
    ExtraListEntries: ListEntries(status: $extraStatus)
      @include(if: $useExtraStatus)
      @client {
      id
      mediaId
      status
    }
  }
`

export const IMPORT_EXTERNAL_LINKS_QUERY = gql`
  query ImportExternalLinks($mediaId: Int!) {
    Media(id: $mediaId) {
      id
      externalLinks {
        id
        site
        url
      }
    }
  }
`
