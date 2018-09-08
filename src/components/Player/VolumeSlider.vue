<template>
<transition>
  <div class="volume-slider">
    <icon
      :icon="muted ? mutedSvg : volumeHighSvg"
      @click.native="onToggleMute"
    />

    <span class="slider-container">
      <input
        type="range"
        min="0"
        max="100"
        :value="volume"
        @input="onChange"
      />

      <span
        class="filler"
        :style="{ width: volume + '%' }"
      />
    </span>
  </div>
</transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mdiVolumeHigh, mdiVolumeMute } from '@mdi/js'

import Icon from '../Icon.vue'

@Component({
  components: { Icon },
})
export default class VolumeSlider extends Vue {
  @Prop(Boolean) public muted!: boolean
  @Prop(Number) public volume!: number
  @Prop() public onChange!: (e: Event) => void
  @Prop() public onToggleMute!: (e: Event) => void

  public initialVolume = Number(localStorage.getItem('volume') || 75)

  public volumeHighSvg = mdiVolumeHigh
  public mutedSvg = mdiVolumeMute
}
</script>

<style scoped lang="scss">
@import '../../colors';

.volume-slider {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  margin-right: 15px;

  & > .icon {
    fill: $white;
    height: 35px;
    width: 35px;
    cursor: pointer;
    margin-right: 5px;
  }

  & > .slider-container {
    position: relative;
    display: flex;
    align-items: center;

    & > input {
      width: 75px;
      height: 4px;
    }

    & > input[type='range'] {
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
      }
    }

    & > .filler {
      position: absolute;
      background: $white;
      height: 4px;
      pointer-events: none;
    }
  }
}
</style>
