<template>
  <div class="list-page">
    <div class="menu">
      <div class="aside">
        <a class="anichart" href="https://anichart.net" v-html="anichartLogo" />

        <a
          v-if="isConnectedTo.anilist"
          class="anilist"
          :href="`https://anilist.co/user/${userId}/animelist`"
          v-html="alLogo"
        />

        <a
          v-if="isConnectedTo.simkl"
          class="simkl"
          :href="`${simklUser.url}/dashboard`"
          v-html="simklLogo"
        />
      </div>

      <text-input
        placeholder="Search in List..."
        value
        :onChange="setFilterString"
      />

      <div class="aside right">
        <transition name="fade">
          <loading v-if="$apollo.loading" :size="26" />
        </transition>
      </div>
    </div>

    <div class="list-container">
      <div
        v-for="status in lists"
        :key="status"
        class="list"
        :class="{ [status.toLowerCase()]: true }"
      >
        <div
          :key="status"
          class="title-bar"
          :class="{ empty: getList(status).length < 1 }"
        >
          {{ getHumanStatus(status) }}
        </div>
        <transition-group
          v-if="getList(status).length > 0"
          tag="div"
          key="EntryContainer"
          class="entry-container"
          @wheel.native.prevent="handleScroll"
        >
          <list-entry
            v-for="entry in getList(status)"
            :key="entry.id"
            :entry="entry"
            :media="media[entry.mediaId]"
          />

          <div key="last" class="padding" />
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { DollarApollo, SmartQuery } from 'vue-apollo/types/vue-apollo'
import { Component, Vue } from 'vue-property-decorator'
import { oc } from 'ts-optchain'

import anichartSvg from '@/assets/anichart.svg'
import anilistSvg from '@/assets/anilist.svg'
import simklSvg from '@/assets/simkl.svg'
import Loading from '@/common/components/loading.vue'
import TextInput from '@/common/components/form/text-input.vue'
import NumberInput from '@/common/components/form/number-input.vue'
import ListEntry from './components/list-entry.vue'

import LIST_QUERY from '@/views/list/list.graphql'
import { LIST_MEDIA_QUERY } from '@/graphql/documents/queries'
import {
  ListMediaMedia,
  ListMediaQuery,
  ListMediaQueryVariables,
  ListViewListEntries,
  ListViewQuery,
  ListViewVariables,
  MediaListStatus,
} from '@/graphql/types'

import { Query } from '@/decorators'
import { getAnilistUserId, getIsConnectedTo, getSimklUser } from '@/state/auth'
import { debounce, humanizeMediaListStatus, isNil, isNotNil } from '@/utils'

export type ListMedia = {
  [key: number]: { media: ListMediaMedia | null; loading: boolean } | undefined
}

const queryOptions = (status: MediaListStatus) =>
  ({
    fetchPolicy: 'cache-and-network',
    query: LIST_QUERY,
    variables: {
      page: 1,
      status,
    },
  } as const)

@Component({
  components: { Loading, ListEntry, TextInput, NumberInput },
})
export default class List extends Vue {
  @Query<List, ListViewQuery, ListViewVariables>({
    ...queryOptions(MediaListStatus.Current),
    update(data) {
      this.getMedia(data.ListEntries.map(e => e.mediaId))

      return data
    },
  })
  public current!: ListViewQuery

  @Query<List, ListViewQuery, ListViewVariables>({
    ...queryOptions(MediaListStatus.Repeating),
    update(data) {
      this.getMedia(data.ListEntries.map(e => e.mediaId))

      return data
    },
  })
  public repeating!: ListViewQuery

  @Query<List, ListViewQuery, ListViewVariables>({
    ...queryOptions(MediaListStatus.Paused),
    update(data) {
      this.getMedia(data.ListEntries.map(e => e.mediaId))

      return data
    },
  })
  public paused!: ListViewQuery

  @Query<List, ListViewQuery, ListViewVariables>({
    ...queryOptions(MediaListStatus.Planning),
    update(data) {
      this.getMedia(data.ListEntries.map(e => e.mediaId))

      return data
    },
  })
  public planning!: ListViewQuery

  @Query<List, ListViewQuery, ListViewVariables>({
    ...queryOptions(MediaListStatus.Dropped),
    update(data) {
      this.getMedia(data.ListEntries.map(e => e.mediaId))

      return data
    },
  })
  public dropped!: ListViewQuery

  @Query<List, ListViewQuery, ListViewVariables>({
    ...queryOptions(MediaListStatus.Completed),
    update(data) {
      this.getMedia(data.ListEntries.map(e => e.mediaId))

      return data
    },
  })
  public completed!: ListViewQuery

  public media: ListMedia = {}

  public page = 1
  public filterString = ''
  public limit = Number(localStorage.getItem('list-limit') || 25)
  public lists = [
    MediaListStatus.Current,
    MediaListStatus.Repeating,
    MediaListStatus.Paused,
    MediaListStatus.Planning,
    MediaListStatus.Completed,
    MediaListStatus.Dropped,
  ] as const

  public anichartLogo = anichartSvg
  public alLogo = anilistSvg
  public simklLogo = simklSvg

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

  public get userId() {
    return getAnilistUserId(this.$store)
  }

  public get isConnectedTo() {
    return getIsConnectedTo(this.$store)
  }

  public get simklUser() {
    return getSimklUser(this.$store)
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

      Vue.set(this.media[id]!, 'loading', loading)
    })
  }

  private async getMedia(mediaIds: number[]) {
    this.setMediaLoading(mediaIds, true)

    const variables: ListMediaQueryVariables = { mediaIds }
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

    this.setMediaLoading(mediaIds, false)
  }

  public handleScroll(e: WheelEvent) {
    const target = e.currentTarget as HTMLDivElement
    target.scrollBy(e.deltaY + e.deltaX, 0)
  }

  public getHumanStatus(status: MediaListStatus) {
    return humanizeMediaListStatus({ progress: null, status }, false)
  }

  public fetchMore() {
    this.page++

    this.$apollo.queries.rawList.fetchMore({
      variables: {
        page: this.page,
      },
      updateQuery: (_: null, { fetchMoreResult: result }): ListViewQuery => ({
        __typename: 'Query',
        ListEntries: result.ListEntries,
      }),
    })
  }

  // beautiful!
  public setFilterString(filter: string) {
    debounce((str: string) => {
      this.filterString = str
    }, 350)(filter)
  }

  public setLimit(value: number) {
    localStorage.setItem('list-limit', value.toString())
    this.limit = value
    this.$forceUpdate()
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

  & > .menu {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 10px 0;
    background: color($dark, 300);
    flex-shrink: 0;

    & > .aside {
      position: absolute;
      top: calc(50% + 2px);
      left: 12px;
      display: flex;
      align-items: center;
      text-decoration: none;
      transform: translateY(-50%);

      &.right {
        left: auto;
        right: 12px;
      }

      & /deep/ svg {
        height: 26px;
        width: 26px;
        margin-right: 15px;
      }
    }

    & > .text-input,
    & > .number-input {
      & /deep/ input {
        text-align: center;
      }
    }
  }

  & > .list-container {
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: auto;
    height: 100%;
    width: 100%;

    & > .list {
      & > .title-bar {
        width: 100%;
        padding: 8px 25px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: 'Raleway', sans-serif;
        font-weight: 200;
        text-shadow: 0 1px 1px transparentize(white, 0.85);
        font-size: 1.5em;

        &.empty {
          padding-bottom: 0;
        }
      }

      & > .entry-container {
        box-sizing: border-box;
        max-width: 100%;
        padding-left: 25px;
        display: flex;
        align-items: center;
        background: transparentize(black, 0.75);
        overflow-x: scroll;

        &::-webkit-scrollbar {
          display: none;
        }

        & > .padding {
          height: 1px; // Required or it doesn't displace anything
          width: 25px;
          flex-shrink: 0;
        }
      }
    }
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
