import { DollarApollo } from 'vue-apollo/types/vue-apollo'
import { Store } from 'vuex'
import { oc } from 'ts-optchain'

import {
  AddToListMutation,
  AniListEntryFragment,
  AnimeViewQuery,
  CreateEntryMutation,
  CreateEntryVariables,
  DeleteEntryMutation,
  DeleteFromListMutation,
  MediaListEntryFromMediaIdQuery,
  MediaListEntryFromMediaIdVariables,
  MediaListStatus,
  Provider,
  SetProgressMutation,
  SetProgressVariables,
  SetScoreMutation,
  SetScoreVariables,
  SetStatusMutation,
  SetStatusSaveMediaListEntry,
  SetStatusVariables,
  StartRewatchingMutation,
  UpdateProgressMutation,
  UpdateScoreMutation,
  UpdateStatusMutation,
} from '@/graphql/types'
import { ListPlugin } from '@/plugins/list/plugin'
import { isNil } from '@/utils'
import { refetchListQuery, writeEpisodeProgressToCache } from '@/utils/cache'
import ANIME_PAGE_QUERY from '@/views/anime/anime.graphql'
import {
  CREATE_ENTRY,
  DELETE_ENTRY,
  SET_PROGRESS,
  SET_SCORE,
  SET_STATUS,
} from '@/plugins/list/anilist/anilist-mutations'
import { MEDIA_LIST_ENTRY_FROM_MEDIA_ID } from '@/graphql/queries'
import { getAnilistUserId } from '@/state/auth'

type ListEntry = AddToListMutation['AddToList']

export class AnilistListPlugin extends ListPlugin implements ListPlugin {
  public name = 'anilist'

  constructor(apollo: DollarApollo<any>, store: Store<any>) {
    super(apollo, store)
  }

  private fromMediaListEntry(
    mediaListEntry: SetStatusSaveMediaListEntry,
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

  private optimisticResponseFromValues(
    anilistId: number,
    values: Pick<AniListEntryFragment, 'id' | 'repeat'> &
      Partial<Pick<AniListEntryFragment, 'status' | 'progress' | 'score'>>,
  ): SetScoreMutation {
    return {
      SaveMediaListEntry: {
        __typename: 'MediaList',
        id: values.id || 0,
        mediaId: anilistId,
        score: values.score || 0,
        progress: values.progress || 0,
        repeat: values.repeat || 0,
        status: values.status || MediaListStatus.Current,
      },
    }
  }

  private async getMediaListEntry(mediaId: number) {
    // TODO: replace with ListEntryFragment
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

    return listEntryResult.data.MediaList
  }

  public async AddToList(
    anilistId: number,
  ): Promise<AddToListMutation['AddToList']> {
    const result = await this.apollo.mutate<CreateEntryMutation>({
      mutation: CREATE_ENTRY,
      variables: { mediaId: anilistId } as CreateEntryVariables,
      refetchQueries: refetchListQuery(this.store),
      update: (cache, { data }) => {
        if (!data) return

        const cachedData = cache.readQuery<AnimeViewQuery>({
          query: ANIME_PAGE_QUERY,
          variables: { id: anilistId },
        })

        cachedData!.anime!.mediaListEntry = data.SaveMediaListEntry

        cache.writeQuery({ query: ANIME_PAGE_QUERY, data: cachedData })
      },
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

    const result = await this.apollo.mutate<DeleteEntryMutation>({
      mutation: DELETE_ENTRY,
      variables: { id },
      refetchQueries: refetchListQuery(this.store),
      update: cache => {
        const data = cache.readQuery<any>({
          query: ANIME_PAGE_QUERY,
          variables: { id: anilistId },
        })
        if (!data || !data.anime) return

        data.anime.mediaListEntry = null
      },
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
    const listEntry = await this.getMediaListEntry(anilistId)
    const oldValues: Pick<
      AniListEntryFragment,
      'id' | 'repeat' | 'score' | 'progress'
    > = {
      id: oc(listEntry).id(0),
      repeat: oc(listEntry).repeat(0),
      score: oc(listEntry).score(0),
      progress: oc(listEntry).progress(0),
    }

    const result = await this.apollo.mutate<SetStatusMutation>({
      mutation: SET_STATUS,
      variables: { mediaId: anilistId, status } as SetStatusVariables,
      refetchQueries: refetchListQuery(this.store),
      optimisticResponse: this.optimisticResponseFromValues(anilistId, {
        ...oldValues,
        status,
      }),
    })

    const errors = oc(result).errors([])
    if (errors.length > 0) throw new Error(errors[0].message)

    if (isNil(result.data)) throw new Error("Didn't get response from AniList")

    return this.fromMediaListEntry(result.data.SaveMediaListEntry!)
  }

  public async StartRewatching(
    anilistId: number,
  ): Promise<StartRewatchingMutation['StartRewatching']> {}

  public async UpdateProgress(
    anilistId: number,
    progress: number,
    provider: Provider,
  ): Promise<UpdateProgressMutation['UpdateProgress']> {
    const listEntry = await this.getMediaListEntry(anilistId)
    const oldValues: Pick<
      AniListEntryFragment,
      'id' | 'score' | 'repeat' | 'status'
    > = {
      id: oc(listEntry).id(0),
      score: oc(listEntry).score(0),
      repeat: oc(listEntry).repeat(0),
      status: oc(listEntry).status(MediaListStatus.Current),
    }

    const result = await this.apollo.mutate<SetProgressMutation>({
      mutation: SET_PROGRESS,
      variables: {
        mediaId: anilistId,
        progress,
      } as SetProgressVariables,
      optimisticResponse: {
        SaveMediaListEntry: {
          ...oldValues,
          __typename: 'MediaList',
          mediaId: anilistId,
          progress,
        },
      },
      refetchQueries: refetchListQuery(this.store),
      update: cache => {
        writeEpisodeProgressToCache(
          cache,
          { animeId: anilistId, episodeNumber: progress, provider },
          progress,
        )
      },
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
    const listEntry = await this.getMediaListEntry(anilistId)
    const oldValues: Pick<
      AniListEntryFragment,
      'id' | 'progress' | 'repeat' | 'status'
    > = {
      id: oc(listEntry).id(0),
      progress: oc(listEntry).progress(0),
      repeat: oc(listEntry).repeat(0),
      status: oc(listEntry).status(MediaListStatus.Completed),
    }

    const result = await this.apollo.mutate<SetScoreMutation>({
      mutation: SET_SCORE,
      variables: { mediaId: anilistId, score } as SetScoreVariables,
      optimisticResponse: this.optimisticResponseFromValues(anilistId, {
        ...oldValues,
        score,
      }),
    })

    const errors = oc(result).errors([])
    if (errors.length > 0) throw new Error(errors[0].message)

    if (isNil(result.data)) throw new Error("Didn't get response from AniList")

    return this.fromMediaListEntry(result.data.SaveMediaListEntry!)
  }
}
