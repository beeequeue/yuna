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
  MediaListEntryFromMediaIdQuery,
  MediaListEntryFromMediaIdVariables,
  MediaListStatus,
  Provider,
  SetScoreMutation,
  SetScoreVariables,
  SetStatusMutation,
  SetStatusSaveMediaListEntry,
  SetStatusVariables,
  UpdateProgressMutation,
  UpdateProgressVariables,
} from '@/graphql/types'
import { ListPlugin } from '@/plugins/list/plugin'
import { isNil } from '@/utils'
import { refetchListQuery, writeEpisodeProgressToCache } from '@/utils/cache'
import ANIME_PAGE_QUERY from '@/views/anime/anime.graphql'
import { ANILIST_LIST_ENTRY_FRAGMENT } from '@/graphql/fragments'
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

  async AddToList(anilistId: number): Promise<ListEntry> {
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

  async UpdateProgress(
    anilistId: number,
    progress: number,
    provider: Provider,
  ): Promise<ListEntry> {
    let listEntry: ListEntry | null = null

    try {
      listEntry = this.apollo.provider.defaultClient.cache.readFragment({
        fragment: ANILIST_LIST_ENTRY_FRAGMENT,
        id: `Media:${anilistId}`,
      })
    } catch (e) {
      /* no-op */
    }

    const optimisticResponse: UpdateProgressMutation = {
      SaveMediaListEntry: {
        __typename: 'MediaList',
        id: oc(listEntry).id(-1),
        mediaId: anilistId,
        progress,
        score: oc(listEntry).score(0),
        repeat: oc(listEntry).rewatched(0),
        status: oc(listEntry).status(MediaListStatus.Current),
      },
    }

    const result = await this.apollo.mutate<UpdateProgressMutation>({
      mutation: SET_PROGRESS,
      variables: {
        mediaId: anilistId,
        progress,
      } as UpdateProgressVariables,
      optimisticResponse,
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
    oldValues: Pick<
      AniListEntryFragment,
      'id' | 'progress' | 'repeat' | 'status'
    >,
  ): Promise<ListEntry> {
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

  public async UpdateStatus(
    anilistId: number,
    status: MediaListStatus,
  ): Promise<ListEntry> {
    // TODO: replace with ListEntryFragment
    const listEntryResult = await this.apollo.provider.defaultClient.query<
      MediaListEntryFromMediaIdQuery
    >({
      query: MEDIA_LIST_ENTRY_FROM_MEDIA_ID,
      fetchPolicy: 'cache-first',
      errorPolicy: 'ignore',
      variables: {
        mediaId: anilistId,
        userId: getAnilistUserId(this.store),
      } as MediaListEntryFromMediaIdVariables,
    })

    const oldValues: Pick<
      AniListEntryFragment,
      'id' | 'progress' | 'repeat' | 'score'
    > = {
      id: oc(listEntryResult.data).MediaList.id(0),
      progress: oc(listEntryResult.data).MediaList.progress(0),
      repeat: oc(listEntryResult.data).MediaList.repeat(0),
      score: oc(listEntryResult.data).MediaList.score(0),
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

  public async DeleteFromList(anilistId: number): Promise<boolean> {
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
}
