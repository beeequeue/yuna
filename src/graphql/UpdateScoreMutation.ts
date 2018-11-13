/* tslint:disable */
// This file was automatically generated and should not be edited.

import { MediaListStatus } from "./..\\graphql-types";

// ====================================================
// GraphQL mutation operation: UpdateScoreMutation
// ====================================================

export interface UpdateScoreMutation_SaveMediaListEntry {
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

export interface UpdateScoreMutation {
  /**
   * Create or update a media list entry
   */
  SaveMediaListEntry: UpdateScoreMutation_SaveMediaListEntry | null;
}

export interface UpdateScoreMutationVariables {
  id?: number | null;
  score?: number | null;
}
