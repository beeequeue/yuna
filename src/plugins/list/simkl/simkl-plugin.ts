import { oc } from 'ts-optchain'

import { ListPlugin, ListPluginType } from '@/plugins/list/plugin'
import { MAL_ID_FROM_ANILIST_ID } from '@/graphql/documents/queries'
import {
  AddToListMutation,
  ListEntry,
  MalIdFromAnilistIdQuery,
  MalIdFromAnilistIdQueryVariables,
  MediaListStatus,
  StartRewatchingMutation,
  UpdateProgressMutation,
  UpdateScoreMutation,
  UpdateStatusMutation,
} from '@/graphql/types'
import { Simkl } from '@/lib/simkl'

export class SimklListPlugin extends ListPlugin implements ListPlugin {
  public static service = 'simkl'
  public service = 'simkl'
  public static type = ListPluginType.Simple
  public type = ListPluginType.Simple

  private async getMALId(anilistId: number) {
    const response = await this.apollo.query<MalIdFromAnilistIdQuery>({
      query: MAL_ID_FROM_ANILIST_ID,
      variables: { mediaId: anilistId } as MalIdFromAnilistIdQueryVariables,
    })

    return oc(response).data.Media.idMal() || null
  }

  public async GetListEntry(anilistId: number): Promise<ListEntry | null> {
    const malId = await this.getMALId(anilistId)
    const watchedInfo = await Simkl.watchedInfo(malId!)

    return {
      id: watchedInfo.show.ids.simkl,
      mediaId: anilistId,
      progress: watchedInfo.watched_episodes_count,
      rewatched: 0,
      score: watchedInfo.user_rating * 10,
      status: Simkl.statusFromSimklStatus(watchedInfo.status),
    }
  }

  public async AddToList(
    anilistId: number,
  ): Promise<AddToListMutation['AddToList']> {
    return undefined
  }

  public async DeleteFromList(entryId: number): Promise<boolean> {
    return undefined
  }

  public async StartRewatching(
    anilistId: number,
  ): Promise<StartRewatchingMutation['StartRewatching']> {
    return undefined
  }

  public async UpdateProgress(
    anilistId: number,
    progress: number,
  ): Promise<UpdateProgressMutation['UpdateProgress']> {
    const malId = await this.getMALId(anilistId)

    await Simkl.addToWatchHistory(malId!, progress)

    return undefined
  }

  public async UpdateScore(
    anilistId: number,
    score: number,
  ): Promise<UpdateScoreMutation['UpdateScore']> {
    return undefined
  }

  public async UpdateStatus(
    anilistId: number,
    status: MediaListStatus,
  ): Promise<UpdateStatusMutation['UpdateStatus']> {
    return undefined
  }
}
