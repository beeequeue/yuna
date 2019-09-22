<template>
  <div class="list" :class="{ [status.toLowerCase()]: true }">
    <div
      :key="status"
      class="title-bar"
      :class="{ empty: !open || list.length < 1 }"
      @click="toggleOpen(status)"
    >
      <icon class="collapser" :class="{ flip: open }" :icon="expandSvg" />

      {{ getHumanStatus(status) }}
    </div>

    <transition>
      <keep-alive>
        <transition-group
          v-if="list.length > 0 && open"
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
      </keep-alive>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mdiChevronDown } from '@mdi/js'

// @ts-ignore
import { ListMedia } from '@/views/list/list.vue'
import Icon from '@/common/components/icon.vue'
import { Required } from '@/decorators'
import { ListViewListEntries, MediaListStatus } from '@/graphql/types'
import { humanizeMediaListStatus } from '@/utils'
import ListEntry from './list-entry.vue'

@Component({ components: { Icon, ListEntry } })
export default class ListRow extends Vue {
  @Required(Array) list!: ListViewListEntries[]
  @Required(Object) media!: ListMedia
  @Required(String) status!: MediaListStatus
  @Required(Function) toggleOpen!: (status: MediaListStatus) => any
  @Required(Function) fetchMore!: (status: MediaListStatus) => any
  @Prop(Boolean) open!: boolean
  @Prop(Boolean) double!: boolean

  public expandSvg = mdiChevronDown

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
@import '../list-variables';

.list {
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.025);
  }

  & > .title-bar {
    width: 100%;
    padding: 5px 25px;
    display: flex;
    align-items: center;
    font-family: 'Raleway', sans-serif;
    font-weight: 200;
    text-shadow: 0 1px 1px transparentize(white, 0.85);
    font-size: 1.5em;
    cursor: pointer;
    transition: padding-bottom 0.25s;

    & > .collapser {
      height: 25px;
      width: 25px;
      fill: $white;
      transform: rotateZ(180deg);
      transition: transform 0.25s;

      &.flip {
        transform: rotateZ(0deg);
      }
    }
  }

  & > .entry-container {
    display: grid;
    grid-auto-columns: calc(#{$entryWidth} - (#{$triangleWidth}));
    grid-template-rows: $entryHeight;
    grid-auto-flow: column;
    grid-gap: 5px;
    justify-items: center;

    height: $entryHeight;
    max-width: 100%;
    padding-left: 25px;
    background: transparentize(black, 0.75);
    overflow-x: scroll;
    transition: height 0.25s, opacity 0.25s;

    &.double {
      height: calc(#{$entryHeight} * 2 + 5px);
      grid-template-rows: $entryHeight $entryHeight;
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
      opacity: 0;
      height: 0;
    }
  }
}
</style>
