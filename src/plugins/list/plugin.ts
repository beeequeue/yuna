import {
  AddToListMutation,
  ListEntryFragment,
  MediaListStatus,
  Provider,
} from '@/graphql/types'

export abstract class ListPlugin {
  public abstract async AddToList(
    anilistId: number,
  ): Promise<AddToListMutation['AddToList']>

  public abstract async UpdateStatus(
    anilistId: number,
    status: MediaListStatus,
    oldValues: Pick<ListEntryFragment, 'id' | 'progress' | 'repeat' | 'score'>,
  ): Promise<AddToListMutation['AddToList']>

  public abstract async UpdateProgress(
    anilistId: number,
    progress: number,
    provider: Provider,
  ): Promise<AddToListMutation['AddToList']>

  public abstract async UpdateScore(
    anilistId: number,
    score: number,
    oldValues: Pick<ListEntryFragment, 'id' | 'progress' | 'repeat' | 'status'>,
  ): Promise<AddToListMutation['AddToList']>
}
