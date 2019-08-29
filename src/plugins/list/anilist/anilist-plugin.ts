import { DollarApollo } from 'vue-apollo/types/vue-apollo'
import { Store } from 'vuex'
import { oc } from 'ts-optchain'

import {
  AddToListMutation,
  AnilistCreateEntryMutation,
  AnilistCreateEntryVariables,
  AnilistDeleteEntryMutation,
  AnilistEditListEntryMutation,
  AnilistEditListEntryMutationVariables,
  AnilistSetProgressMutation,
  AnilistSetProgressVariables,
  AnilistSetScoreMutation,
  AnilistSetScoreVariables,
  AnilistSetStatusMutation,
  AnilistSetStatusSaveMediaListEntry,
  AnilistSetStatusVariables,
  AnilistStartRewatchingMutation,
  AnilistStartRewatchingVariables,
  DeleteFromListMutation,
  EditListEntryOptions,
  MediaListEntryFromMediaIdQuery,
  MediaListEntryFromMediaIdVariables,
  MediaListStatus,
  Mutation,
  StartRewatchingMutation,
  UpdateProgressMutation,
  UpdateScoreMutation,
  UpdateStatusMutation,
} from '@/graphql/types'
import { ListPlugin, ListPluginType } from '@/plugins/list/plugin'
import { isNil } from '@/utils'
import {
  ANILIST_CREATE_ENTRY,
  ANILIST_DELETE_ENTRY,
  ANILIST_EDIT_LIST_ENTRY,
  ANILIST_SET_PROGRESS,
  ANILIST_SET_SCORE,
  ANILIST_SET_STATUS,
  ANILIST_START_REWATCHING,
} from '@/plugins/list/anilist/anilist-documents'
import { MEDIA_LIST_ENTRY_FROM_MEDIA_ID } from '@/graphql/documents/queries'
import { getAnilistUserId } from '@/state/auth'

type ListEntry = AddToListMutation['AddToList']

export class AnilistListPlugin extends ListPlugin implements ListPlugin {
  public static service = 'anilist'
  public service = 'anilist'
  public static type = ListPluginType.Full
  public type = ListPluginType.Full

  constructor(apollo: DollarApollo<any>, store: Store<any>) {
    super(apollo, store)
  }

  private fromMediaListEntry(
    mediaListEntry: AnilistSetStatusSaveMediaListEntry,
  ): ListEntry {
    return {
      __typename: 'ListEntry' as const,
      id: mediaListEntry.id,
      mediaId: mediaListEntry.mediaId,
      status: mediaListEntry.status || MediaListStatus.Planning,
      score: mediaListEntry.score,
      progress: mediaListEntry.progress || 0,
      rewatched: mediaListEntry.repeat || 0,
    }
  }

  public async GetListEntry(mediaId: number): Promise<ListEntry | null> {
    const listEntryResult = await this.apollo.query<
      MediaListEntryFromMediaIdQuery
    >({
      query: MEDIA_LIST_ENTRY_FROM_MEDIA_ID,
      fetchPolicy: 'cache-first',
      errorPolicy: 'ignore',
      variables: {
        mediaId,
        userId: getAnilistUserId(this.store),
      } as MediaListEntryFromMediaIdVariables,
    })

    if (isNil(listEntryResult.data.MediaList)) return null

    return this.fromMediaListEntry(listEntryResult.data.MediaList)
  }

  public async AddToList(
    anilistId: number,
  ): Promise<AddToListMutation['AddToList']> {
    const result = await this.apollo.mutate<AnilistCreateEntryMutation>({
      mutation: ANILIST_CREATE_ENTRY,
      variables: { mediaId: anilistId } as AnilistCreateEntryVariables,
    })

    const errors = oc(result).errors([])
    if (errors.length > 0) throw new Error(errors[0].message)

    if (isNil(result.data)) throw new Error("Didn't get response from AniList")

    return this.fromMediaListEntry(result.data.SaveMediaListEntry!)
  }

  public async DeleteFromList(
    anilistId: number,
  ): Promise<DeleteFromListMutation['DeleteFromList']> {
    const idResult = await this.apollo.query<MediaListEntryFromMediaIdQuery>({
      query: MEDIA_LIST_ENTRY_FROM_MEDIA_ID,
      variables: {
        mediaId: anilistId,
        userId: getAnilistUserId(this.store),
      } as MediaListEntryFromMediaIdVariables,
      fetchPolicy: 'cache-first',
    })

    if (!isNil(idResult.errors)) throw new Error(idResult.errors[0].message)

    if (isNil(idResult.data.MediaList)) {
      return true
    }

    const { id } = idResult.data.MediaList

    const result = await this.apollo.mutate<AnilistDeleteEntryMutation>({
      mutation: ANILIST_DELETE_ENTRY,
      variables: { id },
    })

    const errors = oc(result).errors([])
    if (errors.length > 0) throw new Error(errors[0].message)

    if (isNil(result.data)) throw new Error("Didn't get response from AniList")

    return oc(result.data).DeleteMediaListEntry.deleted(false)
  }

  public async UpdateStatus(
    anilistId: number,
    status: MediaListStatus,
  ): Promise<UpdateStatusMutation['UpdateStatus']> {
    const result = await this.apollo.mutate<AnilistSetStatusMutation>({
      mutation: ANILIST_SET_STATUS,
      variables: { mediaId: anilistId, status } as AnilistSetStatusVariables,
    })

    const errors = oc(result).errors([])
    if (errors.length > 0) throw new Error(errors[0].message)

    if (isNil(result.data)) throw new Error("Didn't get response from AniList")

    return this.fromMediaListEntry(result.data.SaveMediaListEntry!)
  }

  public async StartRewatching(
    anilistId: number,
  ): Promise<StartRewatchingMutation['StartRewatching']> {
    const result = await this.apollo.mutate<AnilistStartRewatchingMutation>({
      mutation: ANILIST_START_REWATCHING,
      variables: { mediaId: anilistId } as AnilistStartRewatchingVariables,
    })

    const errors = oc(result).errors([])
    if (errors.length > 0) throw new Error(errors[0].message)

    if (isNil(result.data)) throw new Error("Didn't get response from AniList")

    return this.fromMediaListEntry(result.data.SaveMediaListEntry!)
  }

  public async UpdateProgress(
    anilistId: number,
    progress: number,
  ): Promise<UpdateProgressMutation['UpdateProgress']> {
    const result = await this.apollo.mutate<AnilistSetProgressMutation>({
      mutation: ANILIST_SET_PROGRESS,
      variables: {
        mediaId: anilistId,
        progress,
      } as AnilistSetProgressVariables,
    })

    const errors = oc(result).errors([])
    if (errors.length > 0) throw new Error(errors[0].message)

    if (isNil(result.data)) throw new Error("Didn't get response from AniList")

    return this.fromMediaListEntry(result.data.SaveMediaListEntry!)
  }

  public async UpdateScore(
    anilistId: number,
    score: number,
  ): Promise<UpdateScoreMutation['UpdateScore']> {
    const result = await this.apollo.mutate<AnilistSetScoreMutation>({
      mutation: ANILIST_SET_SCORE,
      variables: { mediaId: anilistId, score } as AnilistSetScoreVariables,
    })

    const errors = oc(result).errors([])
    if (errors.length > 0) throw new Error(errors[0].message)

    if (isNil(result.data)) throw new Error("Didn't get response from AniList")

    return this.fromMediaListEntry(result.data.SaveMediaListEntry!)
  }

  public async EditListEntry(
    anilistId: number,
    { progress, rewatched, score, status }: EditListEntryOptions,
  ): Promise<Mutation['EditListEntry']> {
    const listEntry = await this.GetListEntry(anilistId)

    if (isNil(listEntry)) throw new Error('Show is not in list!')

    const variables: AnilistEditListEntryMutationVariables = {
      id: listEntry.id,
      progress,
      score,
      repeat: rewatched,
      status,
    }

    const result = await this.apollo.mutate<AnilistEditListEntryMutation>({
      mutation: ANILIST_EDIT_LIST_ENTRY,
      variables,
      errorPolicy: 'all',
    })

    const errors = oc(result).errors([])
    if (errors.length > 0) throw new Error(errors[0].message)

    if (isNil(result.data)) throw new Error("Didn't get response from AniList")

    return this.fromMediaListEntry({
      ...result.data.SaveMediaListEntry!,
      mediaId: anilistId,
    })
  }
}
