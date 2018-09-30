/* tslint:disable */
// This file was automatically generated and should not be edited.

import { MediaListStatus } from "./..\\graphql-types";

// ====================================================
// GraphQL mutation operation: SetStatusMutation
// ====================================================

export interface SetStatusMutation_SaveMediaListEntry {
  __typename: "MediaList";
  /**
   * The id of the list entry
   */
  id: number;
  /**
   * The watching/reading status
   */
  status: MediaListStatus | null;
}

export interface SetStatusMutation {
  /**
   * Create or update a media list entry
   */
  SaveMediaListEntry: SetStatusMutation_SaveMediaListEntry | null;
}

export interface SetStatusMutationVariables {
  id?: number | null;
  status?: MediaListStatus | null;
}
