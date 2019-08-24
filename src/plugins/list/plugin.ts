import {
  AddToListMutation,
  AniListEntryFragment,
  MediaListStatus,
  Provider,
} from '@/graphql/types'
import { AnilistListPlugin } from '@/plugins/list/anilist/anilist-plugin'

export abstract class ListPlugin {
  public abstract name: string

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

  public static getInstalledPlugins(): ListPlugin['constructor'][] {
    return [AnilistListPlugin]
  }
}
