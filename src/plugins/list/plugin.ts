import { DollarApollo } from 'vue-apollo/types/vue-apollo'
import { Store } from 'vuex'
import {
  AddToListMutation,
  AniListEntryFragment,
  MediaListStatus,
  Provider,
} from '@/graphql/types'

export abstract class ListPlugin {
  public abstract name: string

  protected readonly apollo: DollarApollo<any>
  protected readonly store: Store<any>

  protected constructor(apollo: DollarApollo<any>, store: Store<any>) {
    this.apollo = apollo
    this.store = store
  }

  public abstract async AddToList(
    anilistId: number,
  ): Promise<AddToListMutation['AddToList']>

  public abstract async UpdateStatus(
    anilistId: number,
    status: MediaListStatus,
    oldValues: Pick<
      AniListEntryFragment,
      'id' | 'progress' | 'repeat' | 'score'
    >,
  ): Promise<AddToListMutation['AddToList']>

  public abstract async UpdateProgress(
    anilistId: number,
    progress: number,
    provider: Provider,
  ): Promise<AddToListMutation['AddToList']>

  public abstract async UpdateScore(
    anilistId: number,
    score: number,
    oldValues: Pick<
      AniListEntryFragment,
      'id' | 'progress' | 'repeat' | 'status'
    >,
  ): Promise<AddToListMutation['AddToList']>
}
