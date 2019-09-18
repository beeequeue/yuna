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

export const WATCHING_QUERY = gql`
  query WatchingQuery($userId: Int!) {
    listCollection: MediaListCollection(
      userId: $userId
      status_in: [CURRENT, REPEATING]
      type: ANIME
    ) {
      lists {
        isCustomList
        entries {
          info: media {
            id
            externalLinks {
              id
              site
              url
            }
            listEntry @client {
              id
              status
            }
          }
        }
      }
    }
  }
`
export const PLANNING_QUERY = gql`
  query PlanningQuery($userId: Int!) {
    listCollection: MediaListCollection(
      userId: $userId
      status_in: [PLANNING]
      type: ANIME
    ) {
      lists {
        isCustomList
        entries {
          info: media {
            id
            externalLinks {
              id
              site
              url
            }
            listEntry @client {
              id
              status
            }
          }
        }
      }
    }
  }
`
export const PAUSED_QUERY = gql`
  query PausedQuery($userId: Int!) {
    listCollection: MediaListCollection(
      userId: $userId
      status_in: [PAUSED]
      type: ANIME
    ) {
      lists {
        isCustomList
        entries {
          info: media {
            id
            externalLinks {
              id
              site
              url
            }
            listEntry @client {
              id
              status
            }
          }
        }
      }
    }
  }
`
