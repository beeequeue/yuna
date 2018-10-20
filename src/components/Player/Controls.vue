<template>
<div class="controls">
  <div class="cover" @click="debounceCoverClick"/>

  <transition name="fade">
    <div v-if="isPlayerMaximized" class="episode-info">
      <h1>{{episode.title}}</h1>

      <h3>{{animeName}}</h3>
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

    <span class="play-pause button-collapser">
      <transition>
        <icon v-if="paused" key="play" class="button" :icon="playSvg" @click.native="play"/>
        <icon v-else class="button" key="pause" :icon="pauseSvg" @click.native="pause"/>
      </transition>
    </span>

    <volume-slider
      :muted="muted"
      :volume="volume"
      :onChange="onSetVolume"
      :onToggleMute="onToggleMute"
      :open="isPlayerMaximized"
    />

    <transition name="shrink">
      <span v-if="isPlayerMaximized" class="time">
        {{timeString}}
      </span>
    </transition>

    <span class="separator"/>

    <transition name="shrink">
      <span v-if="isPlayerMaximized && listEntry" class="completed button-collapser">
        <transition name="fade">
          <icon
            v-if="listEntry.progress < episode.index"
            key="max"
            class="button"
            :icon="bookmarkSvg"
            v-tooltip.top="'Mark as watched'"
            @click.native="setProgress(episode.index)"
          />
          <icon
            v-else
            class="button"
            key="min"
            :icon="bookmarkRemoveSvg"
            v-tooltip.top="'Unmark as watched'"
            @click.native="setProgress(Math.max(0, episode.index - 1))"
          />
        </transition>
      </span>
    </transition>

    <span v-if="!isFullscreen" class="maximize button-collapser">
      <transition name="fade">
        <icon v-if="!isPlayerMaximized" key="max" class="button" :icon="maximizeSvg" @click.native="maximizePlayer"/>
        <icon v-else class="button" key="min" :icon="minimizeSvg" @click.native="$router.back()"/>
      </transition>
    </span>

    <span class="fullscreen button-collapser">
      <transition name="fade">
        <icon v-if="!isFullscreen" key="fullscreen" class="button" :icon="fullscreenSvg" @click.native="_toggleFullscreen"/>
        <icon v-else class="button" key="fullscreenExit" :icon="fullscreenExitSvg" @click.native="_toggleFullscreen"/>
      </transition>
    </span>
  </div>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import {
  mdiArrowCollapse,
  mdiArrowExpand,
  mdiFullscreen,
  mdiFullscreenExit,
  mdiPause,
  mdiPlay,
  mdiBookmark,
  mdiBookmarkRemove,
} from '@mdi/js'

import { Episode } from '@/types'
import { getIsFullscreen, toggleFullscreen, ListEntry } from '@/state/app'
import { prop, secondsToTimeString } from '@/utils'
import Icon from '../Icon.vue'
import ProgressBar from './ProgressBar.vue'
import VolumeSlider from './VolumeSlider.vue'

@Component({
  components: { VolumeSlider, ProgressBar, Icon },
})
export default class Controls extends Vue {
  @Prop(prop(Object, true))
  public episode!: Episode
  @Prop(prop(String, true))
  public animeName!: string
  @Prop(Object) public listEntry?: ListEntry
  @Prop(prop(Boolean, true))
  public paused!: boolean
  @Prop(prop(Boolean, true))
  public muted!: boolean
  @Prop(prop(Boolean, true))
  public isPlayerMaximized!: boolean
  @Prop(prop(Number, true))
  public volume!: number
  @Prop(prop(Number, true))
  public progressInSeconds!: number
  @Prop(prop(Number, true))
  public progressPercentage!: number
  @Prop(prop(Number, true))
  public loadedPercentage!: number
  @Prop(prop(Function, true))
  public play!: () => void
  @Prop(prop(Function, true))
  public pause!: () => void
  @Prop(prop(Function, true))
  public onSetTime!: (e: Event) => void
  @Prop(prop(Function, true))
  public onSetVolume!: (e: Event) => void
  @Prop(prop(Function, true))
  public onToggleMute!: (e: Event) => void
  @Prop(prop(Function, true))
  public setProgress!: (progress: number) => any

  public get timeString() {
    const current = secondsToTimeString(
      Math.min(this.progressInSeconds, this.episode.duration),
    )
    const duration = secondsToTimeString(this.episode.duration)

    return `${current} / ${duration}`
  }

  public get isFullscreen() {
    return getIsFullscreen(this.$store)
  }

  public playSvg = mdiPlay
  public pauseSvg = mdiPause
  public bookmarkSvg = mdiBookmark
  public bookmarkRemoveSvg = mdiBookmarkRemove
  public maximizeSvg = mdiArrowExpand
  public minimizeSvg = mdiArrowCollapse
  public fullscreenSvg = mdiFullscreen
  public fullscreenExitSvg = mdiFullscreenExit

  private clickTimeout: number | null = null

  public debounceCoverClick() {
    this.handleCoverClick()

    if (!this.clickTimeout) {
      this.clickTimeout = window.setTimeout(() => {
        this.clickTimeout = null
      }, 175)
    } else {
      clearTimeout(this.clickTimeout)
      this.clickTimeout = null

      this.handleCoverClick()
      toggleFullscreen(this.$store)
    }
  }

  public handleCoverClick() {
    if (this.paused) {
      this.play()
    } else {
      this.pause()
    }
  }

  public maximizePlayer() {
    this.$router.push('/player-big')
  }

  public _toggleFullscreen() {
    toggleFullscreen(this.$store)
  }

  public secondsToTimeString(input: number) {
    return secondsToTimeString(input)
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

$buttonSize: 50px;

.controls {
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  opacity: 0;
  user-select: none;
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
    text-shadow: $outline;
    filter: drop-shadow(2px 2px 1px rgba(0, 0, 0, 0.25));
    user-select: initial;

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
  display: flex;
  align-items: center;

  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.75) 0%,
    rgba(0, 0, 0, 0.2) 75%,
    rgba(0, 0, 0, 0) 100%
  );

  & > * {
    &.shrink-enter-active,
    &.shrink-leave-active {
      transition: opacity 0.5s, max-width 0.5s !important;
    }

    &.shrink-enter,
    &.shrink-leave-to {
      opacity: 0 !important;
      max-width: 0 !important;
    }
  }

  & > .separator {
    width: 100%;
  }

  & > *:not(.separator) {
    flex-shrink: 0;
  }

  & > *:not(.progress) {
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.75));
  }

  & > .progress {
    filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.75));
  }

  & > .time {
    margin: 0 5px 3px;
    max-width: 150px;
    opacity: 1;
    overflow: hidden;
    white-space: nowrap;
    font-weight: 400;
    font-size: 1.5em;
    cursor: default;
  }

  & > .button-collapser {
    position: relative;
    display: inline-block;
    flex-shrink: 0;
    height: $buttonSize;
    width: $buttonSize;
    max-width: $buttonSize;
    margin: 0 5px;
    overflow: hidden;

    & > .button {
      position: absolute;
      top: 0;
      left: 0;
    }
  }

  & .button {
    height: $buttonSize;
    width: $buttonSize;
    padding: 6px;

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
