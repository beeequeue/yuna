<template>
  <div
    ref="progressBar"
    class="progress"
    @mousemove="handleMouseOver"
    @mouseleave="hovering = false"
    @mousedown="handleClick"
  >
    <div class="background" />

    <div
      class="loaded"
      :style="{
        left: progressPercentage * 100 - 1.5 + '%',
        right: 100 - loadedPercentage * 100 + '%',
      }"
    />

    <div
      class="played"
      :style="{ right: 100 - progressPercentage * 100 + '%' }"
    />

    <div
      v-tooltip="tooltip"
      class="time-tooltip"
      :style="{ left: `${mousePosition * 100}%` }"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { secondsToTimeString } from '@/utils'
import { Required } from '@/decorators'

@Component
export default class ProgressBar extends Vue {
  @Required(Number) public duration!: number
  @Required(Number) public progressPercentage!: number
  @Required(Number) public loadedPercentage!: number
  @Required(Boolean) public visible!: boolean
  @Required(Function) public onSetTime!: (value: number) => void

  public hovering = false
  public mouseDown = false
  public mousePosition = 0

  public shouldUpdateProgress = true

  $refs!: {
    progressBar: HTMLInputElement
  }

  public get tooltip() {
    return {
      content: this.hoverTime,
      placement: 'top',
      show: this.visible && this.hovering,
    }
  }

  public get hoverTime() {
    return secondsToTimeString(Math.round(this.mousePosition * this.duration))
  }

  public handleMouseOver(e: MouseEvent) {
    this.hovering = true
    this.mousePosition = e.offsetX / this.$refs.progressBar.clientWidth

    if (this.mouseDown) {
      const newProgress = Math.round(this.mousePosition * this.duration)
      this.onSetTime(newProgress)
    }
  }

  public handleMouseDown() {
    this.shouldUpdateProgress = false
  }

  public handleClick() {
    const newProgress = Math.round(this.mousePosition * this.duration)

    this.onSetTime(newProgress)
    this.mouseDown = true

    window.onmouseup = () => {
      this.mouseDown = false
      window.onmouseup = null
    }
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
