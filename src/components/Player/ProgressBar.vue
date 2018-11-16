<template>
<div
  class="progress"
  ref="progressBar"
  @mousemove="handleMouseOver"
  @mouseleave="hovering = false"
  @mousedown="handleClick"
>
  <div class="background"/>

  <div
    class="loaded"
    :style="{ left: (progressPercentage * 100 - 1.5) + '%', right: (100 - loadedPercentage * 100) + '%' }"
  />

  <div
    class="played"
    :style="{ right: (100 - progressPercentage * 100) + '%' }"
  />

  <div
    class="time-tooltip"
    v-tooltip="tooltip"
    :style="{ left: `${mousePosition * 100}%` }"
  />
</div>

</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { secondsToTimeString } from '@/utils'

@Component
export default class ProgressBar extends Vue {
  @Prop(Number) public duration!: number
  @Prop(Number) public progressPercentage!: number
  @Prop(Number) public loadedPercentage!: number
  @Prop(Function) public onSetTime!: (value: number) => void

  public hovering = false
  public mousePosition = 0

  public shouldUpdateProgress = true

  $refs!: {
    progressBar: HTMLInputElement
  }

  public get tooltip() {
    return {
      content: this.hoverTime,
      placement: 'top',
      show: this.hovering,
    }
  }

  public get hoverTime() {
    return secondsToTimeString(Math.round(this.mousePosition * this.duration))
  }

  public handleMouseOver(e: MouseEvent) {
    this.hovering = true
    this.mousePosition = e.layerX / this.$refs.progressBar.clientWidth
  }

  public handleMouseDown() {
    this.shouldUpdateProgress = false
  }

  public handleClick() {
    const newProgress = Math.round(this.mousePosition * this.duration)

    this.onSetTime(newProgress)
  }

  public handleMouseUp() {
    this.shouldUpdateProgress = true
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.progress {
  position: absolute;
  top: -15px;
  left: 0;
  width: 100%;
  padding: 6px 0;
  z-index: 1;

  & > .background {
    width: 100%;
    height: 8px;
    background: rgba(0.25, 0.25, 0.25, 0.5);
  }

  & > .played,
  & > .loaded {
    position: absolute;
    top: 6px;
    height: 8px;
    background: $highlight;
    pointer-events: none;
    border-top-right-radius: 15px;
    border-bottom-right-radius: 15px;
  }

  & > .played {
    left: 0;
  }

  & > .loaded {
    background: rgba(255, 255, 255, 0.35);
  }

  & > .time-tooltip {
    position: absolute;
    top: 0;
  }
}
</style>
