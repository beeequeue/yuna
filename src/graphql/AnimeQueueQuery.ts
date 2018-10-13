/* tslint:disable */
// This file was automatically generated and should not be edited.

import { MediaStatus, MediaListStatus } from "./..\\graphql-types";

// ====================================================
// GraphQL query operation: AnimeQueueQuery
// ====================================================

export interface AnimeQueueQuery_anime_title {
  __typename: "MediaTitle";
  /**
   * The currently authenticated users preferred title language. Default romaji for non-authenticated
   */
  userPreferred: string | null;
}

export interface AnimeQueueQuery_anime_coverImage {
  __typename: "MediaCoverImage";
  /**
   * The cover image of media at its largest size
   */
  large: string | null;
}

export interface AnimeQueueQuery_anime_mediaListEntry {
  __typename: "MediaList";
  /**
   * The id of the list entry
   */
  id: number;
  /**
   * The amount of episodes/chapters consumed by the user
   */
  progress: number | null;
  /**
   * The watching/reading status
   */
  status: MediaListStatus | null;
  /**
   * The amount of times the user has rewatched/read the media
   */
  repeat: number | null;
}

export interface AnimeQueueQuery_anime {
  __typename: "Media";
  /**
   * The id of the media
   */
  id: number;
  /**
   * The mal id of the media
   */
  idMal: number | null;
  /**
   * The official titles of the media in various languages
   */
  title: AnimeQueueQuery_anime_title | null;
  /**
   * The amount of episodes the anime has when complete
   */
  episodes: number | null;
  /**
   * The current releasing status of the media
   */
  status: MediaStatus | null;
  /**
   * The url for the media page on the AniList website
   */
  siteUrl: string | null;
  /**
   * The banner image of the media
   */
  bannerImage: string | null;
  /**
   * The cover images of the media
   */
  coverImage: AnimeQueueQuery_anime_coverImage | null;
  /**
   * The authenticated user's media list entry for the media
   */
  mediaListEntry: AnimeQueueQuery_anime_mediaListEntry | null;
}

export interface AnimeQueueQuery {
  /**
   * Media query
   */
  anime: AnimeQueueQuery_anime | null;
}

export interface AnimeQueueQueryVariables {
  id?: number | null;
}
