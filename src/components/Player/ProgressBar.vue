<template>
<div class="progress" @mousemove="handleMouseOver" @mouseleave="hovering = false">
  <div
    class="played"
    :style="{ left: 0, right: (100 - progressPercentage * 100) + '%' }"
  />

  <input
    type="range"
    min="0"
    :max="duration"
    :value="publicProgress"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @input.prevent="handleChange"
  />

  <div
    class="loaded"
    :style="{ left: (progressPercentage * 100) + '%', right: (100 - loadedPercentage * 100) + '%' }"
  />

  <div
    class="time-tooltip"
    v-tooltip="tooltip"
    :style="{ left: `${mousePosition * 100}%` }"
  />
</div>

</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { secondsToTimeString } from '@/utils'

@Component
export default class ProgressBar extends Vue {
  @Prop(Number) public duration!: number
  @Prop(Number) public progressInSeconds!: number
  @Prop(Number) public progressPercentage!: number
  @Prop(Number) public loadedPercentage!: number
  @Prop(Function) public onSetTime!: (e: Event) => void

  public hovering = false
  public mousePosition = 0

  public publicProgress = this.progressInSeconds
  public shouldUpdateProgress = true

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
    this.mousePosition = e.pageX / window.outerWidth
  }

  public handleMouseDown() {
    this.shouldUpdateProgress = false
  }

  public handleChange(e: any) {
    this.onSetTime(e)
    this.publicProgress = e.target.value
  }

  public handleMouseUp() {
    this.shouldUpdateProgress = true
  }

  @Watch('progressInSeconds')
  public updatePublicProgress() {
    if (!this.shouldUpdateProgress) return

    this.publicProgress = this.progressInSeconds
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
  z-index: 1;

  & > input {
    width: 100%;
    height: 8px;
  }

  & > .played,
  & > .loaded {
    position: absolute;
    top: 7px;
    height: 8px;
    background: $highlight;
    pointer-events: none;
  }

  & > .loaded {
    background: rgba(255, 255, 255, 0.35);
  }

  & > input[type='range'] {
    -webkit-appearance: none;
    background: rgba(0.25, 0.25, 0.25, 0.5);

    &::-webkit-slider-thumb {
      position: relative;
      -webkit-appearance: none;
      height: 25px;
      width: 25px;
      border-radius: 100%;
      background: $highlight;
      z-index: 1;
      margin-top: -2px;
    }
  }

  & > .time-tooltip {
    position: absolute;
    top: 0;
  }
}
</style>
