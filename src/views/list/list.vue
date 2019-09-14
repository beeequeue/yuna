<template>
  <div class="list-page">
    <div class="menu">
      <div class="links">
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

      <text-input placeholder="Search..." value :onChange="setFilterString" />
    </div>

    <transition-group tag="div" key="ListContainer" class="list-container">
      <div
        v-for="status in lists"
        :key="status"
        class="list"
        :class="{ [status.toLowerCase()]: true }"
      >
        <div :key="status" class="title-bar">
          {{ status }}
        </div>
        <transition-group
          tag="div"
          key="EntryContainer"
          class="entry-container"
        >
          <list-entry
            v-for="entry in _lists[status]"
            :key="entry.id"
            :entry="entry"
            :media="media[entry.mediaId]"
          />
        </transition-group>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { DollarApollo, SmartQuery } from 'vue-apollo/types/vue-apollo'
import { Component, Vue } from 'vue-property-decorator'
import { oc } from 'ts-optchain'

import anichartSvg from '@/assets/anichart.svg'
import anilistSvg from '@/assets/anilist.svg'
import simklSvg from '@/assets/simkl.svg'
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
import { debounce, isNil, isNotNil } from '@/utils'

type Lists = { [key in MediaListStatus]: ListViewListEntries[] }
export type ListMedia = {
  [key: number]: { media: ListMediaMedia | null; loading: boolean } | undefined
}

@Component({ components: { ListEntry, TextInput, NumberInput } })
export default class List extends Vue {
  @Query<List, ListViewQuery, ListViewVariables>({
    fetchPolicy: 'cache-and-network',
    query: LIST_QUERY,
    variables() {
      return {
        page: 1,
      }
    },
    update(data) {
      this.getMedia(data.ListEntries.map(e => e.mediaId))

      return data
    },
  })
  public rawList!: ListViewQuery

  public media: ListMedia = {}

  public page = 1
  public filterString = ''
  public limit = Number(localStorage.getItem('list-limit') || 25)
  public lists = [
    MediaListStatus.Current,
    MediaListStatus.Repeating,
    MediaListStatus.Paused,
    MediaListStatus.Planning,
    MediaListStatus.Dropped,
    MediaListStatus.Completed,
  ] as const

  public anichartLogo = anichartSvg
  public alLogo = anilistSvg
  public simklLogo = simklSvg

  public $apollo!: DollarApollo<any> & {
    queries: {
      lists: SmartQuery<List>
    }
  }

  public get _lists() {
    return oc(this.rawList)
      .ListEntries([])
      .reduce(
        (lists, entry) => {
          if (isNil(lists[entry.status])) {
            lists[entry.status] = []
          }

          lists[entry.status].push(entry)

          return lists
        },
        {} as Lists,
      )
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
  background: rgba(0, 0, 0, 0.85);
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

    & > .links {
      position: absolute;
      top: calc(50% + 2px);
      left: 12px;
      display: flex;
      align-items: center;
      text-decoration: none;
      transform: translateY(-50%);

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
      }

      & > .entry-container {
        width: 100%;
        display: flex;
        align-items: center;
        overflow-x: auto;

        &::-webkit-scrollbar {
          display: none;
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
