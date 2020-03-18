<template>
  <div ref="scrollBar" class="scroll-bar-container">
    <div
      v-for="(item, i) in items"
      :key="i"
      v-tooltip="item.toString()"
      class="episode"
      :class="getClasses(item)"
      :style="{ width: `${tickWidth}px` }"
      @click="handleClick(i)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Required } from '@/decorators'
import { clamp, isNil } from '@/utils'

@Component
export default class ScrollBar extends Vue {
  @Required(Array) public items!: number[]
  @Required(Number) public itemSize!: number
  @Required(Function) public scrollToEpisode!: (index: number) => void
  @Prop(Number) public progress!: number | null

  public episodeWrapper: Vue | null = null
  public scrollIndex = 0

  $refs!: {
    scrollBar: HTMLDivElement
  }

  public get tickWidth() {
    return this.clientWidth / this.items.length
  }

  public get clientWidth() {
    if (!this.episodeWrapper) return 0

    return this.episodeWrapper.$el.clientWidth
  }

  public get totalWidth() {
    if (!this.episodeWrapper) return 0

    return (
      this.episodeWrapper.$el.scrollWidth - this.episodeWrapper.$el.clientWidth
    )
  }

  private intervalId = 0

  public mounted() {
    this.intervalId = window.setInterval(() => {
      const container = (this.$parent.$refs as { container: Vue }).container
      if (!container) return

      window.clearInterval(this.intervalId)

      container.$el.addEventListener('scroll', this.updateMark)
      this.episodeWrapper = container

      this.updateMark()
    }, 100)
  }

  public destroyed() {
    this.episodeWrapper!.$el.removeEventListener('scroll', this.updateMark)
  }

  public getClasses(item: number) {
    return {
      watched: !isNil(this.progress) && this.progress >= item,
      selected: item === this.scrollIndex,
    }
  }

  public updateMark() {
    const scrollAmount = this.episodeWrapper!.$el.scrollLeft

    const index = Math.floor(
      (scrollAmount / this.totalWidth) * this.items.length,
    )

    this.scrollIndex = this.items[clamp(index, 0, this.items.length - 1)]
  }

  public handleClick(index: number) {
    this.scrollToEpisode(index)
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.scroll-bar-container {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 15px;
  background: color($main, 300);
  pointer-events: all;
  z-index: 2;
  overflow: hidden;

  & > .episode {
    height: 100%;
    cursor: pointer;

    transition: background 0.1s;

    &.watched {
      background: color($main, 600);
    }

    &:hover,
    &.selected {
      background: color($highlight, 500);
    }

    &:not(:first-child) {
      border-left: 1px solid color($highlight, 400);
    }
  }
}
</style>
