/* tslint:disable */
// This file was automatically generated and should not be edited.

import { MediaListStatus } from "./..\\graphql-types";

// ====================================================
// GraphQL mutation operation: SaveListEntryMutation
// ====================================================

export interface SaveListEntryMutation_SaveMediaListEntry {
  __typename: "MediaList";
  /**
   * The id of the list entry
   */
  id: number;
  /**
   * The score of the entry
   */
  score: number | null;
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

export interface SaveListEntryMutation {
  /**
   * Create or update a media list entry
   */
  SaveMediaListEntry: SaveListEntryMutation_SaveMediaListEntry | null;
}

export interface SaveListEntryMutationVariables {
  id: number;
  progress: number;
  status: MediaListStatus;
  repeat: number;
  score: number;
}
