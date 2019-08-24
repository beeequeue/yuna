import { DollarApollo } from 'vue-apollo/types/vue-apollo'
import { Store } from 'vuex'
import { oc } from 'ts-optchain'

import {
  AddToListMutation,
  AnimeViewQuery,
  CreateEntryMutation,
  CreateEntryVariables,
  ListEntryFragment,
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
import { LIST_ENTRY_FRAGMENT } from '@/graphql/fragments'
import { CREATE_ENTRY, SET_PROGRESS, SET_SCORE, SET_STATUS } from '@/plugins/list/anilist/mutations'

type ListEntry = AddToListMutation['AddToList']

export class AnilistListPlugin implements ListPlugin {
  private readonly apollo: DollarApollo<any>
  private readonly store: Store<any>

  constructor(apollo: DollarApollo<any>, store: Store<any>) {
    this.apollo = apollo
    this.store = store
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
    values: Pick<ListEntryFragment, 'id' | 'repeat'> &
      Partial<Pick<ListEntryFragment, 'status' | 'progress' | 'score'>>,
  ): SetScoreMutation {
    return {
      SaveMediaListEntry: {
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
      variables: { mediaId: anilistId, status } as CreateEntryVariables,
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
        fragment: LIST_ENTRY_FRAGMENT,
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
        repeat: oc(listEntry).repeat(0),
        status: oc(listEntry).status(MediaListStatus.Current),
      },
    }

    return this.apollo.mutate<UpdateProgressMutation>({
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
  }

  public async UpdateScore(
    anilistId: number,
    score: number,
    oldValues: Pick<ListEntryFragment, 'id' | 'progress' | 'repeat' | 'status'>,
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
    oldValues: Pick<ListEntryFragment, 'id' | 'progress' | 'repeat' | 'score'>,
  ): Promise<ListEntry> {
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
}
