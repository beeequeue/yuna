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
        :value="filterString"
        :onChange="setFilterString"
      />
    </div>

    <transition-group tag="div" class="list-container">
      <div
        v-for="list in getLists(data)"
        :key="list.name"
        class="list"
      >
        <h1>{{ list.name }}</h1>

        <list-entry
          v-for="entry in list.entries"
          :key="entry.id"
          :entry="entry"
        />
      </div>
    </transition-group>
  </template>
</ApolloQuery>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { path } from 'rambdax'

import LIST_QUERY from '@/graphql/ListQuery.graphql'
import { ListQuery, ListQuery_listCollection_lists } from '@/graphql/ListQuery'
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

  public getLists(data: ListQuery) {
    return path<ListQuery_listCollection_lists[]>('listCollection.lists', data)
  }

  public setFilterString(value: string) {
    this.filterString = value
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
  background: rgba(0, 0, 0, 0.75);

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

      & > .list-entry.v-move {
        transition: 0.5s;
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
