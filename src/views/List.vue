<template>
<ApolloQuery
  class="list-page"
  :query="LIST_QUERY"
  :variables="{ userId }"
>
  <template slot-scope="{ result: { loading, error, data } }">
    <div class="menu">
      <text-input
        placeholder="Filter..."
        value=""
        :onChange="setFilterString"
      />
    </div>

    <div class="list-container">
      <transition-group
        tag="div"
        v-for="list in getLists(data)"
        v-if="list.entries && list.entries.length > 0"
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
    </div>
  </template>
</ApolloQuery>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import Fuse from 'fuse.js'
import { debounce, path } from 'rambdax'

import LIST_QUERY from '@/graphql/ListQuery.graphql'
import {
  ListQuery,
  ListQuery_listCollection_lists,
  ListQuery_listCollection_lists_entries,
} from '@/graphql/ListQuery'
import { getAnilistUserId } from '@/state/auth'

import ListEntry from '@/components/ListEntry.vue'
import TextInput from '@/components/Form/TextInput.vue'

@Component({ components: { ListEntry, TextInput } })
export default class List extends Vue {
  public filterString = ''

  public LIST_QUERY = LIST_QUERY

  public get userId() {
    return getAnilistUserId(this.$store)
  }

  @Watch('filterString')
  public updateFilterString() {}

  public getLists(data: ListQuery) {
    const lists = path<ListQuery_listCollection_lists[]>(
      'listCollection.lists',
      data,
    )

    if (!lists) return []

    if (this.filterString.length < 1) {
      return lists
    }

    const filteredLists = lists.map(list => {
      if (!list.entries) return

      const fuse = new Fuse<ListQuery_listCollection_lists_entries>(
        list.entries as any,
        {
          caseSensitive: false,
          shouldSort: false,
          keys: [
            'anime.title.userPreferred',
            'anime.title.english',
            'anime.title.romaji',
          ] as any,
          threshold: 0.5,
        },
      )

      return {
        ...list,
        entries: fuse.search(this.filterString),
      }
    })

    return filteredLists
  }

  // beautiful!
  public setFilterString(filter: string) {
    debounce((str: string) => {
      this.filterString = str
    }, 650)(filter)
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.list-page {
  position: absolute;
  top: 80px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.85);

  & > .menu {
    width: 100%;
    padding: 10px 0;
    background: darken($dark, 3%);
    flex-shrink: 0;

    & > .text-input /deep/ input {
      text-align: center;
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
}

.route-enter,
.route-leave-to {
  background: none;

  & > .menu {
    transform: translateY(-100%);
  }
}
</style>
