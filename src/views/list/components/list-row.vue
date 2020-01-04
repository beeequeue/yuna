<template>
  <div class="list" :class="{ [status.toLowerCase()]: true }">
    <div
      :key="status"
      class="title-bar"
      :class="{ empty: !open || list.length < 1 }"
      @click="toggleOpen(status)"
    >
      <icon
        class="collapser"
        :class="{ flip: list.length > 0 && open }"
        :icon="expandSvg"
      />

      {{ getHumanStatus(status) }}

      <span v-if="lengthString !== '0'"> ( {{ lengthString }} ) </span>
    </div>

    <transition>
      <keep-alive>
        <transition-group
          v-if="list.length > 0 && open"
          key="EntryContainer"
          tag="div"
          class="entry-container"
          :class="classes"
          @wheel.native="handleScroll"
        >
          <list-entry
            v-for="entry in visibleEntries"
            :key="entry.id"
            :entry="entry"
            :media="media[entry.mediaId]"
            :class="{ double }"
          />
        </transition-group>
      </keep-alive>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mdiChevronDown } from '@mdi/js'

import Icon from '@/common/components/icon.vue'
import { Required } from '@/decorators'
import { ListViewListEntries, MediaListStatus } from '@/graphql/types'
import { clamp, humanizeMediaListStatus } from '@/utils'
import { ListMedia } from '../types'
import ListEntry from './list-entry.vue'

@Component({ components: { Icon, ListEntry } })
export default class ListRow extends Vue {
  @Required(Array) list!: ListViewListEntries[]
  @Required(Number) totalLength!: number
  @Required(Object) media!: ListMedia
  @Required(String) status!: MediaListStatus
  @Required(Function) toggleOpen!: (status: MediaListStatus) => any
  @Prop(Boolean) open!: boolean
  @Prop(Boolean) double!: boolean

  public itemsScrolled = 0
  public lastScroll = 0

  public expandSvg = mdiChevronDown

  public $refs!: {
    entryContainer: HTMLDivElement
  }

  public get classes() {
    return {
      double: this.double,
    }
  }

  public get visibleItems() {
    return this.double ? 10 : 5
  }

  public get visibleEntries() {
    return this.list.slice(
      this.itemsScrolled,
      this.itemsScrolled + this.visibleItems,
    )
  }

  public get lengthString() {
    if (this.list.length !== this.totalLength) {
      return `${this.list.length}/${this.totalLength}`
    }

    return this.list.length.toString()
  }

  public handleScroll(e: WheelEvent) {
    const msSinceLastScroll = Date.now() - this.lastScroll
    const scrollAmount = e.deltaY + e.deltaX
    let scrollDelta = Math.sign(scrollAmount)

    if (this.list.length < 5) return

    if (msSinceLastScroll <= 100) {
      return e.preventDefault()
    }

    if (this.double) {
      scrollDelta *= 2
    }

    const newScroll = clamp(
      this.itemsScrolled + scrollDelta,
      0,
      this.list.length - this.visibleItems + 2,
    )

    this.lastScroll = Date.now()

    if (newScroll === this.itemsScrolled) return
    this.itemsScrolled = newScroll

    e.preventDefault()
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
    font-variant-numeric: lining-nums;
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
    position: relative;
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
