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

      <div class="number-input-filler" />

      <text-input placeholder="Filter..." value :onChange="setFilterString" />

      <number-input :value="limit" :onChange="setLimit" />
    </div>

    <transition-group tag="div" class="list-container">
      <transition-group
        tag="div"
        v-for="(list, name) in lists"
        :key="name"
        class="list"
      >
        <h1 v-if="list.length > 0" :key="name">{{ name.toLowerCase() }}</h1>

        <list-entry v-for="entry in list" :key="entry.mediaId" :entry="entry" />
      </transition-group>
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
import {
  ListViewListEntries,
  ListViewQuery,
  ListViewVariables,
  MediaListStatus,
} from '@/graphql/types'

import { Query } from '@/decorators'
import { getAnilistUserId, getIsConnectedTo, getSimklUser } from '@/state/auth'
import { debounce, isNil } from '@/utils'

type Lists = { [key in MediaListStatus]: ListViewListEntries[] }

const baseLists: Lists = {
  [MediaListStatus.Current]: [],
  [MediaListStatus.Repeating]: [],
  [MediaListStatus.Paused]: [],
  [MediaListStatus.Planning]: [],
  [MediaListStatus.Dropped]: [],
  [MediaListStatus.Completed]: [],
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
  })
  public rawList!: ListViewQuery

  public page = 1
  public filterString = ''
  public limit = Number(localStorage.getItem('list-limit') || 25)

  public anichartLogo = anichartSvg
  public alLogo = anilistSvg
  public simklLogo = simklSvg

  public $apollo!: DollarApollo<any> & {
    queries: {
      lists: SmartQuery<List>
    }
  }

  public get lists() {
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
        { ...baseLists },
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

    & > .number-input,
    & > .number-input-filler {
      width: 75px;
      margin: 0 10px;
    }
  }

  & > .list-container {
    position: relative;
    overflow: auto;
    width: 100%;

    & > .list {
      width: 100%;
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      padding: 10px 15px;

      & > h1 {
        width: 100%;
        font-weight: 500 !important;
        text-shadow: $outline;
        margin: 5px 0 15px;
        text-transform: capitalize;
      }

      &.v-move {
        transition: 0.5s;
      }

      &.v-leave-active,
      &.v-enter-active {
        overflow: hidden;
        transition: opacity 0.35s, height 0.5s, padding 0.5s;
      }

      &.v-leave {
        height: 225px;
      }

      &.v-leave-to,
      &.v-enter {
        height: 0;
        opacity: 0;
        padding-top: 0;
        padding-bottom: 0;
      }

      & > .entry {
        &.v-move {
          transition: 0.5s;
        }

        &.v-leave-active,
        &.v-enter-active {
          transition: opacity 0.35s, width 0.5s, margin 0.5s;
        }

        &.v-leave-to,
        &.v-enter {
          width: 0;
          opacity: 0;
          margin-left: 0;
          margin-right: 0;
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
