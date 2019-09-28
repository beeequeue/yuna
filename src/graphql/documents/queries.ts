import gql from 'graphql-tag'
import { ANILIST_LIST_ENTRY_FRAGMENT } from '@/graphql/documents/fragments'

export const SINGLE_MEDIA_QUERY = gql`
  query SingleMedia($mediaId: Int!) {
    SingleMedia: Media(id: $mediaId) {
      id
      title {
        userPreferred
        english
        romaji
        native
      }
      coverImage {
        medium
        color
      }
      isFavourite
      episodes
    }
  }
`

export const LIST_LIST_ENTRIES = gql`
  query ListView($page: Int!, $perPage: Int!, $status: MediaListStatus!) {
    ListEntries(page: $page, perPage: $perPage, status: $status) @client {
      id
      mediaId
      status
      progress
      score
      rewatched
    }
  }
`

export const LIST_FILTER_ENTRIES = gql`
  query ListFilterEntries($page: Int!) {
    ListEntries(page: $page, perPage: 500) @client {
      id
      mediaId
      status
    }
  }
`

export const LIST_FILTER_MEDIA = gql`
  query ListFilterMedia($ids: [Int!]!) {
    Page(perPage: 50) {
      media(id_in: $ids) {
        id
        title {
          english
          romaji
        }
        genres
        status
        externalLinks {
          id
          site
        }
      }
    }
  }
`

export const LIST_MEDIA_QUERY = gql`
  query ListMedia($page: Int!, $mediaIds: [Int!]!) {
    Page(page: $page, perPage: 50) {
      pageInfo {
        lastPage
      }
      media(id_in: $mediaIds, sort: [TITLE_ENGLISH, TITLE_ROMAJI]) {
        id
        title {
          userPreferred
          english
          romaji
          native
        }
        bannerImage
        coverImage {
          extraLarge
          color
        }
        isFavourite
        episodes
      }
    }
  }
`

export const LIST_ENTRY_SCORE_QUERY = gql`
  query ListEntry($mediaId: Int!) {
    ListEntry(mediaId: $mediaId) @client {
      id
      score
    }
  }
`

export const MEDIA_LIST_ENTRY_FROM_MEDIA_ID = gql`
  query MediaListEntryFromMediaId($mediaId: Int!, $userId: Int!) {
    MediaList(userId: $userId, mediaId: $mediaId) {
      ...AniListEntry
    }
  }

  ${ANILIST_LIST_ENTRY_FRAGMENT}
`

export const EPISODE_LIST = gql`
  query EpisodeList($id: Int!, $provider: Provider!) {
    episodes: Episodes(id: $id, provider: $provider) @client {
      provider
      id
      animeId
      title
      duration
      progress
      index
      episodeNumber
      url
      subtitles
      thumbnail
      isWatched
    }
  }
`

export const MAL_ID_FROM_ANILIST_ID = gql`
  query MalIdFromAnilistId($mediaId: Int!) {
    Media(id: $mediaId) {
      id
      idMal
    }
  }
`

export const ANILIST_IDS_FROM_MAL_IDS = gql`
  query AnilistIdsFromMalIds($malIds: [Int!]!) {
    Page(perPage: 50) {
      media(idMal_in: $malIds) {
        id
        idMal
      }
    }
  }
`

export const EPISODE_FEED_LIST_IDS = gql`
  query EpisodeFeedListIds {
    ListEntries(status_not: COMPLETED) @client {
      id
      mediaId
    }
  }
`

export const MAL_SCORE_QUERY = gql`
  query MalScore($id: Int!) {
    anime: Media(id: $id) {
      id
      idMal
      scoreMal @client
    }
  }
`

export const SIMKL_INFO_QUERY = gql`
  query SimklInfo($id: Int!) {
    Media(id: $id) {
      id
      scoreSimkl @client
      linkSimkl @client
    }
  }
`
