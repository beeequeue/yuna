<template>
  <div class="list-page">
    <div class="menu">
      <a
        class="anilist"
        :href="`https://anilist.co/user/${userId}/animelist`"
        v-tooltip.right="'Open in AniList'"
      >
        <span v-html="alLogo" />
      </a>

      <div class="number-input-filler" />

      <text-input placeholder="Filter..." value :onChange="setFilterString" />

      <number-input :value="limit" :onChange="setLimit" />
    </div>

    <transition-group tag="div" class="list-container">
      <transition-group
        tag="div"
        v-for="list in getLists(data)"
        :key="list.name"
        class="list"
      >
        <h1 :key="list.name">{{ list.name }}</h1>

        <list-entry
          v-for="entry in list.entries"
          :key="entry.id"
          :entry="entry"
        />
      </transition-group>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Fuse from 'fuse.js'
import { oc } from 'ts-optchain'

import anilistLogoSvg from '@/assets/anilist.svg'
import TextInput from '@/common/components/form/text-input.vue'
import NumberInput from '@/common/components/form/number-input.vue'
import ListEntry from './components/list-entry.vue'

import LIST_QUERY from '@/views/list/list.graphql'
import {
  ListViewQuery,
  ListViewLists,
  ListViewEntries,
  ListViewVariables,
} from '@/graphql/types'

import { Query } from '@/decorators'
import { getAnilistUserId } from '@/state/auth'
import { debounce } from '@/utils'

@Component({ components: { ListEntry, TextInput, NumberInput } })
export default class List extends Vue {
  @Query<List, ListViewQuery, ListViewVariables>({
    fetchPolicy: 'cache-and-network',
    query: LIST_QUERY,
    variables() {
      return {
        userId: this.userId,
        statuses: undefined as any,
      }
    },
  })
  public data!: ListViewQuery
  public filterString = ''
  public limit = Number(localStorage.getItem('list-limit') || 25)

  public alLogo = anilistLogoSvg

  public get userId() {
    return getAnilistUserId(this.$store)
  }

  public getLists(data: ListViewQuery) {
    const lists = oc(data).listCollection.lists([] as ListViewLists[])

    if (!lists) return []

    if (this.filterString.length < 1) {
      return lists.map(list => ({
        ...list,
        entries: (list.entries as ListViewEntries[]).slice(0, this.limit),
      }))
    }

    const filteredLists = lists.map(list => {
      if (!list.entries) return

      const fuse = new Fuse<ListViewEntries>(list.entries as any, {
        caseSensitive: false,
        shouldSort: true,
        keys: [
          'anime.title.userPreferred',
          'anime.title.english',
          'anime.title.romaji',
        ] as any,
        threshold: 0.35,
      })

      return {
        ...list,
        entries: fuse.search(this.filterString).splice(0, this.limit),
      }
    })

    return filteredLists
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

    & > .anilist {
      position: absolute;
      top: calc(50% + 2px);
      left: 12px;
      transform: translateY(-50%);

      & /deep/ svg {
        height: 26px;
        width: 26px;
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
      overflow: hidden;

      & > h1 {
        width: 100%;
        font-weight: 500 !important;
        text-shadow: $outline;
        margin: 5px 0 15px;
      }

      &.v-move {
        transition: 0.5s;
      }

      &.v-leave-active,
      &.v-enter-active {
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
