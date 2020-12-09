<template>
  <transition>
    <div class="volume-slider">
      <icon
        :icon="muted ? mutedSvg : volumeHighSvg"
        @click.native="onToggleMute"
      />

      <span class="slider-container" :class="{ open }">
        <input
          :class="{ red: volume >= 200 }"
          type="range"
          min="0"
          max="100"
          step="1"
          :value="clampedVolume"
          @input="onChange"
        />

        <span class="filler" :style="{ width: clampedVolume + '%' }" />

        <span
          v-if="volume > 100"
          class="filler red"
          :style="{ width: volume - 100 + '%' }"
        />
      </span>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"
import { mdiVolumeHigh, mdiVolumeMute } from "@mdi/js"

import Icon from "@/common/components/icon.vue"
import { clamp } from "@/utils"

@Component({
  components: { Icon },
})
export default class VolumeSlider extends Vue {
  @Prop(Boolean) public muted!: boolean
  @Prop(Number) public volume!: number
  @Prop(Boolean) public open!: number
  @Prop(Function) public onChange!: (e: Event) => void
  @Prop(Function) public onToggleMute!: (e: Event) => void

  public volumeHighSvg = mdiVolumeHigh
  public mutedSvg = mdiVolumeMute

  public get clampedVolume() {
    return clamp(this.volume, 0, 100)
  }
}
</script>

<style scoped lang="scss">
@import "../../colors";

.volume-slider {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 12px 0 6px;

  & > .icon {
    fill: $white;
    height: 35px;
    width: 35px;
    cursor: pointer;
    margin-right: 5px;
    flex-shrink: 0;
  }

  & > .slider-container {
    position: relative;
    display: flex;
    align-items: center;
    opacity: 0;
    width: 0;

    will-change: opacity, width;
    transition: opacity 0.15s, width 0.2s;

    &.open {
      opacity: 1;
      min-width: 75px;
      width: 75px;
    }

    & > input {
      width: 100%;
      height: 4px;
    }

    & > input[type="range"] {
      -webkit-appearance: none;
      background: rgba(0, 0, 0, 0.5);
      cursor: pointer;

      &::-webkit-slider-thumb {
        position: relative;
        -webkit-appearance: none;
        height: 15px;
        width: 15px;
        border-radius: 100%;
        background: $white;
        z-index: 1;
        transition: background 0.15s;
      }

      &.red::-webkit-slider-thumb {
        background: $danger;
      }
    }

    & > .filler {
      position: absolute;
      background: $white;
      height: 4px;
      pointer-events: none;

      &.red {
        background: $danger;
      }
    }
  }

  &:hover {
    &:not(.open) > .slider-container {
      opacity: 1;
      width: 50px;
    }
  }
}
</style>
