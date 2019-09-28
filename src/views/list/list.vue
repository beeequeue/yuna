<template>
  <div class="list-page">
    <filters @show-filtered="log" />

    <div class="list-container">
      <list-row
        v-for="status in lists"
        :key="status"
        :list="getList(status)"
        :status="status"
        :fetchMore="fetchMore"
        :media="media"
        :open="meta[status].open"
        :toggleOpen="toggleOpen"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { DollarApollo, SmartQuery } from 'vue-apollo/types/vue-apollo'
import { Component, Vue } from 'vue-property-decorator'
import { oc } from 'ts-optchain'

import Loading from '@/common/components/loading.vue'
import TextInput from '@/common/components/form/text-input.vue'
import NumberInput from '@/common/components/form/number-input.vue'
import ListRow from './components/list-row.vue'
import ListEntry from './components/list-entry.vue'
import Filters from './components/filters.vue'
import { LIST_MEDIA_QUERY } from '@/graphql/documents/queries'
import {
  ListMediaMedia,
  ListMediaQuery,
  ListMediaQueryVariables,
  ListViewListEntries,
  ListViewQuery,
  ListViewQueryVariables,
  MediaListStatus,
} from '@/graphql/types'

import { ListQuery } from '@/decorators'
import { isNil, isNotNil, LocalStorageKey } from '@/utils'
import { getRows } from '@/utils/cache'

export type ListMedia = {
  [key: number]: { media: ListMediaMedia | null; loading: boolean } | undefined
}

type MetaData = { [key in MediaListStatus]: { page: number; open: boolean } }

@Component({
  components: { Filters, ListRow, Loading, ListEntry, TextInput, NumberInput },
})
export default class List extends Vue {
  log(filtered: { [key in MediaListStatus]: number[] }) {
    // eslint-disable-next-line no-console
    console.log(filtered)
  }

  @ListQuery(MediaListStatus.Current)
  public current!: ListViewQuery

  @ListQuery(MediaListStatus.Repeating)
  public repeating!: ListViewQuery

  @ListQuery(MediaListStatus.Planning)
  public planning!: ListViewQuery

  @ListQuery(MediaListStatus.Paused)
  public paused!: ListViewQuery

  @ListQuery(MediaListStatus.Dropped)
  public dropped!: ListViewQuery

  @ListQuery(MediaListStatus.Completed)
  public completed!: ListViewQuery

  public media: ListMedia = {}

  public lists = [
    MediaListStatus.Current,
    MediaListStatus.Repeating,
    MediaListStatus.Planning,
    MediaListStatus.Paused,
    MediaListStatus.Completed,
    MediaListStatus.Dropped,
  ] as const

  // page: -1 means no more can be fetched
  public meta: MetaData = this.lists.reduce(
    (obj, status) => {
      obj[status] = { page: 1, open: this.getOpenState(status) }

      return obj
    },
    {} as MetaData,
  )

  public $refs!: {
    entries: HTMLDivElement
  }
  public $apollo!: DollarApollo<any> & {
    queries: {
      lists: SmartQuery<List>
    }
  }

  public getList(status: MediaListStatus) {
    return oc(this as any)[status.toLowerCase()].ListEntries(
      [],
    ) as ListViewListEntries[]
  }

  private setMediaLoading(mediaIds: number[], loading: boolean) {
    mediaIds.forEach(id => {
      if (isNil(this.media[id])) {
        Vue.set(this.media, id, {
          media: null,
          loading,
        })

        return
      }

      Vue.set(
        this.media[id]!,
        'loading',
        isNil(this.media[id]!.media) ? loading : false,
      )
    })
  }

  private getLocalStorageKey(status: MediaListStatus) {
    return `${LocalStorageKey.LIST_OPEN}_${status}`
  }

  private saveOpenState(status: MediaListStatus) {
    localStorage.setItem(
      this.getLocalStorageKey(status),
      this.meta[status].open.toString(),
    )
  }

  private getOpenState(status: MediaListStatus): boolean {
    return JSON.parse(
      localStorage.getItem(this.getLocalStorageKey(status)) || 'true',
    )
  }

  public toggleOpen(status: MediaListStatus) {
    this.meta[status].open = !this.meta[status].open

    this.saveOpenState(status)
  }

  public async getMedia(mediaIds: number[]) {
    const idsToFetch = mediaIds.filter(
      id => !Object.keys(this.media).includes(id.toString()),
    )

    if (idsToFetch.length < 1) return

    this.setMediaLoading(idsToFetch, true)

    const variables: ListMediaQueryVariables = { mediaIds: idsToFetch }
    const result = await this.$apollo.query<ListMediaQuery>({
      fetchPolicy: 'cache-first',
      query: LIST_MEDIA_QUERY,
      variables,
    })

    oc(result.data)
      .Page.media([])
      .filter(isNotNil)
      .forEach(media => {
        Vue.set(this.media, media.id, {
          ...this.media[media.id]!,
          media,
        })
      })

    this.setMediaLoading(idsToFetch, false)
  }

  public fetchMore(status: MediaListStatus) {
    const query = this.$apollo.queries[status.toLowerCase()]
    const entries = oc(this as any)[status.toLowerCase()].ListEntries([])

    return (visible: boolean) => {
      if (
        !visible ||
        query.loading ||
        this.meta[status].page === -1 ||
        entries.length % 10 !== 0
      ) {
        return
      }

      this.meta[status].page++

      const variables: ListViewQueryVariables = {
        page: this.meta[status].page,
        perPage: 10 * getRows(status),
        status,
      }
      query.fetchMore({
        variables,
        updateQuery: (
          previous: ListViewQuery,
          { fetchMoreResult: result },
        ): ListViewQuery => {
          if (result.ListEntries.length < 1) {
            this.meta[status].page = -1
            return {
              ListEntries: previous.ListEntries,
            }
          }

          return {
            ListEntries: [...previous.ListEntries, ...result.ListEntries],
          }
        },
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.list-page {
  position: absolute;
  top: 80px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.925);
  user-select: none;

  & > .list-container {
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: auto;
    height: 100%;
    width: 100%;
    padding-bottom: 50px;
  }
}

.route-enter-active,
.route-leave-active {
  transition: background 0.5s;

  & > .menu {
    transition: transform 0.5s;
  }

  & > .list-container {
    transition: opacity 0.5s, transform 0.5s;
  }
}

.route-enter,
.route-leave-to {
  background: none;

  & > .menu {
    transform: translateY(-100%);
  }

  & > .list-container {
    opacity: 0;
    transform: translateY(2%);
  }
}
</style>
