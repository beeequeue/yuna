import gql from 'graphql-tag'
import { LIST_ENTRY_FRAGMENT } from '@/graphql/documents/fragments'

export const ADD_TO_LIST = gql`
  mutation AddToList($anilistId: Int!) {
    AddToList(anilistId: $anilistId) @client {
      ...ListEntry
    }
  }

  ${LIST_ENTRY_FRAGMENT}
`

export const UPDATE_STATUS = gql`
  mutation UpdateStatus($anilistId: Int!, $status: MediaListStatus!) {
    UpdateStatus(anilistId: $anilistId, status: $status) @client {
      ...ListEntry
    }
  }

  ${LIST_ENTRY_FRAGMENT}
`

export const START_REWATCHING = gql`
  mutation StartRewatching($anilistId: Int!) {
    StartRewatching(anilistId: $anilistId) @client {
      ...ListEntry
    }
  }

  ${LIST_ENTRY_FRAGMENT}
`

export const UPDATE_PROGRESS = gql`
  mutation UpdateProgress(
    $anilistId: Int!
    $progress: Int!
    $provider: Provider!
  ) {
    UpdateProgress(
      anilistId: $anilistId
      progress: $progress
      provider: $provider
    ) @client {
      ...ListEntry
    }
  }

  ${LIST_ENTRY_FRAGMENT}
`

export const UPDATE_SCORE = gql`
  mutation UpdateScore($anilistId: Int!, $score: Int!) {
    UpdateScore(anilistId: $anilistId, score: $score) @client {
      ...ListEntry
    }
  }

  ${LIST_ENTRY_FRAGMENT}
`

export const DELETE_FROM_LIST = gql`
  mutation DeleteFromList($anilistId: Int!) {
    DeleteFromList(anilistId: $anilistId) @client
  }
`

export const EDIT_LIST_ENTRY = gql`
  mutation EditListEntry($anilistId: Int!, $options: EditListEntryOptions!) {
    EditListEntry(anilistId: $anilistId, options: $options) @client {
      ...ListEntry
    }
  }

  ${LIST_ENTRY_FRAGMENT}
`
