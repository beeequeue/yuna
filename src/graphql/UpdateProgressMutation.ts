/* tslint:disable */
// This file was automatically generated and should not be edited.

import { MediaListStatus } from "./..\\graphql-types";

// ====================================================
// GraphQL mutation operation: UpdateProgressMutation
// ====================================================

export interface UpdateProgressMutation_SaveMediaListEntry {
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

export interface UpdateProgressMutation {
  /**
   * Create or update a media list entry
   */
  SaveMediaListEntry: UpdateProgressMutation_SaveMediaListEntry | null;
}

export interface UpdateProgressMutationVariables {
  id?: number | null;
  progress?: number | null;
}
