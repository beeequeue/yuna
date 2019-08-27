import gql from 'graphql-tag'
import { ANILIST_LIST_ENTRY_FRAGMENT } from '@/graphql/documents/fragments'

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
