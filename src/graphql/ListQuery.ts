/* tslint:disable */
// This file was automatically generated and should not be edited.

import { MediaListStatus } from "./..\\graphql-types";

// ====================================================
// GraphQL query operation: ListQuery
// ====================================================

export interface ListQuery_listCollection_lists_entries_anime_title {
  __typename: "MediaTitle";
  /**
   * The currently authenticated users preferred title language. Default romaji for non-authenticated
   */
  userPreferred: string | null;
}

export interface ListQuery_listCollection_lists_entries_anime_coverImage {
  __typename: "MediaCoverImage";
  /**
   * The cover image url of the media at a large size
   */
  large: string | null;
}

export interface ListQuery_listCollection_lists_entries_anime {
  __typename: "Media";
  /**
   * The id of the media
   */
  id: number;
  /**
   * The official titles of the media in various languages
   */
  title: ListQuery_listCollection_lists_entries_anime_title | null;
  /**
   * The cover images of the media
   */
  coverImage: ListQuery_listCollection_lists_entries_anime_coverImage | null;
  /**
   * If the media is marked as favourite by the current authenticated user
   */
  isFavourite: boolean;
  /**
   * The amount of episodes the anime has when complete
   */
  episodes: number | null;
}

export interface ListQuery_listCollection_lists_entries {
  __typename: "MediaList";
  /**
   * The id of the list entry
   */
  id: number;
  /**
   * The watching/reading status
   */
  status: MediaListStatus | null;
  /**
   * The amount of episodes/chapters consumed by the user
   */
  progress: number | null;
  /**
   * The score of the entry
   */
  score: number | null;
  /**
   * The amount of times the user has rewatched/read the media
   */
  repeat: number | null;
  anime: ListQuery_listCollection_lists_entries_anime | null;
}

export interface ListQuery_listCollection_lists {
  __typename: "MediaListGroup";
  isCustomList: boolean | null;
  name: string | null;
  /**
   * Media list entries
   */
  entries: (ListQuery_listCollection_lists_entries | null)[] | null;
}

export interface ListQuery_listCollection {
  __typename: "MediaListCollection";
  /**
   * Grouped media list entries
   */
  lists: (ListQuery_listCollection_lists | null)[] | null;
}

export interface ListQuery {
  /**
   * Media list collection query, provides list pre-grouped by status & custom
   * lists. User ID and Media Type arguments required.
   */
  listCollection: ListQuery_listCollection | null;
}

export interface ListQueryVariables {
  userId: number;
}
