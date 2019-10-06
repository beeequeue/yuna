<template>
  <div class="list-page">
    <!--    <filters @show-filtered="" />-->

    <div class="list-container">
      <list-row
        v-for="status in lists"
        :key="status"
        :list="getList(status)"
        :status="status"
        :media="media"
        :open="meta[status].open"
        :double="status === 'PLANNING'"
        :toggleOpen="toggleOpen"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
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
  MediaListStatus,
} from '@/graphql/types'

import { isNil, isNotNil, LocalStorageKey, prop, propEq } from '@/utils'
import { getAllEntries } from '@/graphql/queries'

export type ListMedia = {
  [key: number]: { media: ListMediaMedia | null; loading: boolean } | undefined
}

type MetaData = { [key in MediaListStatus]: { open: boolean } }

type Entries = PromiseReturnType<typeof getAllEntries>

@Component({
  components: { Filters, ListRow, Loading, ListEntry, TextInput, NumberInput },
})
export default class List extends Vue {
  public async mounted() {
    this.entries = await getAllEntries(this)
  }

  public entries: Entries = []

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
      obj[status] = { open: this.getOpenState(status) }

      return obj
    },
    {} as MetaData,
  )

  public $refs!: {
    entries: HTMLDivElement
  }

  public getList(status: MediaListStatus) {
    return this.entries.filter(propEq('status', status))
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

  @Watch('entries')
  public async getMedia() {
    const mediaIds = this.entries.map(prop('mediaId'))

    const idsToFetch = mediaIds.filter(
      id => !Object.keys(this.media).includes(id.toString()),
    )

    if (idsToFetch.length < 1) return

    this.setMediaLoading(idsToFetch, true)

    const gottenMedia: ListMediaMedia[] = []
    let lastPage = Infinity
    let page = 1

    do {
      if (page > lastPage) break

      const variables: ListMediaQueryVariables = { page, mediaIds: idsToFetch }
      const { data, errors } = await this.$apollo.query<ListMediaQuery>({
        fetchPolicy: 'cache-first',
        query: LIST_MEDIA_QUERY,
        variables,
      })

      if (errors || isNil(data)) break

      lastPage = oc(data).Page.pageInfo.lastPage(Infinity)
      page++

      const newMedia = oc(data)
        .Page.media([])
        .filter(isNotNil)

      newMedia.forEach(media => {
        Vue.set(this.media, media.id, {
          ...this.media[media.id]!,
          media,
        })
      })

      this.setMediaLoading(newMedia.map(prop('id')), false)
    } while (page <= lastPage)
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
    overflow-x: hidden;
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
