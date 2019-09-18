import { MediaListStatus } from '@/graphql/types'
<template>
  <div class="list" :class="{ [status.toLowerCase()]: true }">
    <div :key="status" class="title-bar" :class="{ empty: list.length < 1 }">
      {{ getHumanStatus(status) }}
    </div>

    <transition>
      <transition-group
        v-if="list.length > 0"
        tag="div"
        key="EntryContainer"
        class="entry-container"
        :class="classes"
        @wheel.native="handleScroll"
      >
        <list-entry
          v-for="entry in list"
          :key="entry.id"
          :entry="entry"
          :media="media[entry.mediaId]"
        />

        <div
          v-if="list.length > 4"
          key="last"
          class="padding"
          v-visibility="fetchMore(status)"
        />
      </transition-group>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
// @ts-ignore
import { ListMedia } from '@/views/list/list.vue'
import { Required } from '@/decorators'
import { ListViewListEntries, MediaListStatus } from '@/graphql/types'
import { humanizeMediaListStatus } from '@/utils'
import ListEntry from './list-entry.vue'

@Component({ components: { ListEntry } })
export default class ListRow extends Vue {
  @Required(Array) list!: ListViewListEntries[]
  @Required(Object) media!: ListMedia
  @Required(String) status!: MediaListStatus
  @Required(Function) fetchMore!: (status: MediaListStatus) => any
  @Prop(Boolean) double!: boolean

  public get classes() {
    return {
      double: this.status === MediaListStatus.Planning,
    }
  }

  public handleScroll(e: WheelEvent) {
    const target = e.currentTarget as HTMLDivElement

    if (target.childElementCount > 4) {
      e.preventDefault()
      target.scrollBy(e.deltaY + e.deltaX, 0)
    }
  }

  public getHumanStatus(status: MediaListStatus) {
    return humanizeMediaListStatus({ progress: null, status }, false)
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.list {
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
    height: 115px;
    max-width: 100%;
    padding-left: 25px;
    display: flex;
    align-items: center;
    background: transparentize(black, 0.75);
    overflow-x: scroll;
    transition: height 0.25s;

    &.double {
      height: 235px;
      flex-direction: column;
      flex-wrap: wrap;

      & > .entry:nth-child(odd) {
        margin-bottom: 5px;
      }
    }

    &::-webkit-scrollbar {
      display: none;
    }

    & > .padding {
      height: 1px; // Required or it doesn't displace anything
      width: 100px;
      flex-shrink: 0;
    }

    &.v-enter,
    &.v-leave-to {
      height: 0;
    }
  }
}
</style>
