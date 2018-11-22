/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteListEntryMutation
// ====================================================

export interface DeleteListEntryMutation_DeleteMediaListEntry {
  __typename: "Deleted";
  /**
   * If an item has been successfully deleted
   */
  deleted: boolean | null;
}

export interface DeleteListEntryMutation {
  /**
   * Delete a media list entry
   */
  DeleteMediaListEntry: DeleteListEntryMutation_DeleteMediaListEntry | null;
}

export interface DeleteListEntryMutationVariables {
  id: number;
}
