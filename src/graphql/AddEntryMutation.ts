/* tslint:disable */
// This file was automatically generated and should not be edited.

import { MediaListStatus } from "./..\\graphql-types";

// ====================================================
// GraphQL mutation operation: AddEntryMutation
// ====================================================

export interface AddEntryMutation_SaveMediaListEntry {
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
   * The score of the entry
   */
  score: number | null;
  /**
   * The amount of times the user has rewatched/read the media
   */
  repeat: number | null;
}

export interface AddEntryMutation {
  /**
   * Create or update a media list entry
   */
  SaveMediaListEntry: AddEntryMutation_SaveMediaListEntry | null;
}

export interface AddEntryMutationVariables {
  mediaId?: number | null;
  status?: MediaListStatus | null;
}
