<template>
<div class="controls">
  <div class="cover" @click="paused ? play() : pause()"/>

  <transition name="fade">
    <div v-if="isPlayerMaximized" class="episode-info">
      <h1>Episode {{episode.index}}: {{episode.name}}</h1>

      <h3>{{episode.animeName}}</h3>
    </div>
  </transition>

  <div class="toolbar">
    <progress-bar
      :duration="episode.duration"
      :progressPercentage="progressPercentage"
      :progressInSeconds="progressInSeconds"
      :loadedPercentage="loadedPercentage"
      :onSetTime="onSetTime"
    />

    <span class="button-collapser">
      <transition>
        <icon v-if="paused" key="play" class="button" :icon="playSvg" @click.native="play"/>
        <icon v-else class="button" key="pause" :icon="pauseSvg" @click.native="pause"/>
      </transition>
    </span>

    <span class="separator"/>

    <span class="button-collapser">
      <transition>
        <icon v-if="!isPlayerMaximized" key="max" class="button" :icon="maximizeSvg" @click.native="maximizePlayer"/>
        <icon v-else class="button" key="min" :icon="minimizeSvg" @click.native="$router.back()"/>
      </transition>
    </span>
  </div>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mdiArrowCollapse, mdiArrowExpand, mdiPause, mdiPlay } from '@mdi/js'

import Icon from '../Icon.vue'
import ProgressBar from './ProgressBar.vue'
import { Episode } from '../../types'

@Component({
  components: { ProgressBar, Icon },
})
export default class Controls extends Vue {
  @Prop() public episode!: Episode
  @Prop(Boolean) public paused!: boolean
  @Prop(Number) public progressInSeconds!: number
  @Prop(Number) public progressPercentage!: number
  @Prop(Number) public loadedPercentage!: number
  @Prop() public play!: () => void
  @Prop() public pause!: () => void
  @Prop() public onSetTime!: (e: Event) => void

  public get isPlayerMaximized() {
    return this.$route.path === '/player-big'
  }

  public maximizePlayer() {
    this.$router.push('/player-big')
  }

  public playSvg = mdiPlay
  public pauseSvg = mdiPause
  public maximizeSvg = mdiArrowExpand
  public minimizeSvg = mdiArrowCollapse
}
</script>

<style scoped lang="scss">
@import '../../colors';

$buttonSize: 45px;

.controls {
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  opacity: 0;
  transition: opacity 0.15s;
  transition-delay: 0.5s;

  & > .cover {
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
  }

  & > .episode-info {
    position: absolute;
    top: 5px;
    left: 5px;
    color: $white;
    font-size: 26px;
    text-align: left;
    text-shadow: 2px 2px 1px rgba(0, 0, 0, 0.85);

    & > h1 {
      margin: 5px 15px;
      font-size: 1em;
      font-weight: 400;
    }
    & > h3 {
      margin: 5px 15px;
      font-size: 0.8em;
      font-weight: 500;
    }
  }

  &:hover {
    opacity: 1;
    transition-delay: 0s;
  }
}

.toolbar {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 5px 0;
  display: flex;
  align-items: center;

  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.75) 0%,
    rgba(0, 0, 0, 0.2) 75%,
    rgba(0, 0, 0, 0) 100%
  );

  & > .separator {
    width: 100%;
  }

  & > .button-collapser {
    position: relative;
    display: inline-block;
    flex-shrink: 0;
    height: $buttonSize;
    width: $buttonSize;

    & > .button {
      position: absolute;
      top: 0;
      left: 0;
    }
  }

  & .button {
    height: $buttonSize;
    width: $buttonSize;
    padding: 5px;

    fill: white;
    cursor: pointer;
    filter: drop-shadow(0 0 1px black);

    &.v-enter-active,
    &.v-leave-active {
      will-change: opacity;
      transition: opacity 0.1s, transform 0.1s;
    }

    &.v-enter,
    &.v-leave-to {
      opacity: 0;
      transform: scale(0.5);
    }
  }
}
</style>
