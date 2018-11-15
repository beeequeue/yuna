/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PlanningQuery
// ====================================================

export interface PlanningQuery_listCollection_lists_entries_info {
  __typename: "Media";
  /**
   * The id of the media
   */
  id: number;
}

export interface PlanningQuery_listCollection_lists_entries {
  __typename: "MediaList";
  info: PlanningQuery_listCollection_lists_entries_info | null;
}

export interface PlanningQuery_listCollection_lists {
  __typename: "MediaListGroup";
  isCustomList: boolean | null;
  /**
   * Media list entries
   */
  entries: (PlanningQuery_listCollection_lists_entries | null)[] | null;
}

export interface PlanningQuery_listCollection {
  __typename: "MediaListCollection";
  /**
   * Grouped media list entries
   */
  lists: (PlanningQuery_listCollection_lists | null)[] | null;
}

export interface PlanningQuery {
  /**
   * Media list collection query, provides list pre-grouped by status & custom lists. User ID and Media Type arguments required.
   */
  listCollection: PlanningQuery_listCollection | null;
}

export interface PlanningQueryVariables {
  userId: number;
}
