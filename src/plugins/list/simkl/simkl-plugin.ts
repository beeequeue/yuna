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
import { Simkl, SimklListEntry } from '@/lib/simkl'
import { isNil } from '@/utils'

export class SimklListPlugin extends ListPlugin implements ListPlugin {
  public static service = 'simkl'
  public service = 'simkl'
  public static type = ListPluginType.Full
  public type = ListPluginType.Full

  private async getMALId(anilistId: number) {
    const response = await this.apollo.query<MalIdFromAnilistIdQuery>({
      fetchPolicy: 'cache-first',
      query: MAL_ID_FROM_ANILIST_ID,
      variables: { mediaId: anilistId } as MalIdFromAnilistIdQueryVariables,
    })

    return oc(response).data.Media.idMal() || null
  }

  private fromWatchedInfo(anilistId: number, data: SimklListEntry | null): ListEntry {
    if (isNil(data)) return null

    return {
      id: data.show.ids.simkl,
      mediaId: anilistId,
      progress: data.watched_episodes_count,
      rewatched: 0,
      score: data.user_rating * 10,
      status: Simkl.statusFromSimklStatus(data.status),
    }
  }

  public async GetListEntry(anilistId: number): Promise<ListEntry | null> {
    const malId = await this.getMALId(anilistId)

    if (isNil(malId)) return null

    const item = await Simkl.watchedInfo(malId)

    return this.fromWatchedInfo(anilistId, item)
  }

  public async AddToList(
    anilistId: number,
  ): Promise<AddToListMutation['AddToList']> {
    const malId = await this.getMALId(anilistId)

    if (isNil(malId)) {
      throw new Error('Could not find necessary data to add item to list.')
    }

    await Simkl.addItemToList(malId, 'plantowatch')

    const item = await Simkl.watchedInfo(malId)

    return this.fromWatchedInfo(anilistId, item)
  }

  public async DeleteFromList(anilistId: number): Promise<boolean> {
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
