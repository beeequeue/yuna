/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: WatchingQuery
// ====================================================

export interface WatchingQuery_listCollection_lists_entries_info {
  __typename: "Media";
  /**
   * The id of the media
   */
  id: number;
}

export interface WatchingQuery_listCollection_lists_entries {
  __typename: "MediaList";
  info: WatchingQuery_listCollection_lists_entries_info | null;
}

export interface WatchingQuery_listCollection_lists {
  __typename: "MediaListGroup";
  isCustomList: boolean | null;
  /**
   * Media list entries
   */
  entries: (WatchingQuery_listCollection_lists_entries | null)[] | null;
}

export interface WatchingQuery_listCollection {
  __typename: "MediaListCollection";
  /**
   * Grouped media list entries
   */
  lists: (WatchingQuery_listCollection_lists | null)[] | null;
}

export interface WatchingQuery {
  /**
   * Media list collection query, provides list pre-grouped by status & custom lists. User ID and Media Type arguments required.
   */
  listCollection: WatchingQuery_listCollection | null;
}

export interface WatchingQueryVariables {
  userId: number;
}
