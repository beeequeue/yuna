/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PausedQuery
// ====================================================

export interface PausedQuery_listCollection_lists_entries_info {
  __typename: "Media";
  /**
   * The id of the media
   */
  id: number;
}

export interface PausedQuery_listCollection_lists_entries {
  __typename: "MediaList";
  info: PausedQuery_listCollection_lists_entries_info | null;
}

export interface PausedQuery_listCollection_lists {
  __typename: "MediaListGroup";
  isCustomList: boolean | null;
  /**
   * Media list entries
   */
  entries: (PausedQuery_listCollection_lists_entries | null)[] | null;
}

export interface PausedQuery_listCollection {
  __typename: "MediaListCollection";
  /**
   * Grouped media list entries
   */
  lists: (PausedQuery_listCollection_lists | null)[] | null;
}

export interface PausedQuery {
  /**
   * Media list collection query, provides list pre-grouped by status & custom
   * lists. User ID and Media Type arguments required.
   */
  listCollection: PausedQuery_listCollection | null;
}

export interface PausedQueryVariables {
  userId: number;
}
