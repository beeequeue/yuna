<template>
  <div
    class="controls"
    :class="{ visible: settingsOpen || visible }"
    @mousemove="goVisible"
    @click="goVisible"
    @mouseout="handleMouseLeave"
  >
    <div class="cover" @click="debounceCoverClick" />

    <transition name="fade">
      <player-title
        v-if="isPlayerMaximized"
        :anime="anime"
        :episode="episode"
        :listEntry="listEntry"
      />
    </transition>

    <icon class="button close" :icon="closeSvg" @click.native="closePlayer" />

    <div class="toolbar">
      <progress-bar
        :duration="duration"
        :progressPercentage="progressPercentage"
        :loadedPercentage="loadedPercentage"
        :onSetTime="onSetTime"
      />

      <transition name="shrink">
        <icon
          v-if="isPlayerMaximized"
          class="button"
          :class="{ disabled: episode.index < 1 }"
          :icon="prevSvg"
          @click.native="go(-1)"
        />
      </transition>

      <span class="play-pause button-collapser">
        <transition>
          <icon
            v-if="paused"
            key="play"
            class="button"
            :icon="playSvg"
            @click.native="play"
          />
          <icon
            v-else
            class="button"
            key="pause"
            :icon="pauseSvg"
            @click.native="pause"
          />
        </transition>
      </span>

      <transition name="shrink">
        <icon
          v-if="isPlayerMaximized"
          class="button"
          :class="{ disabled: nextEpisode == null }"
          :icon="nextSvg"
          @click.native="go(1)"
        />
      </transition>

      <volume-slider
        :muted="muted"
        :volume="volume"
        :onChange="onSetVolume"
        :onToggleMute="onToggleMute"
        :open="isPlayerMaximized"
      />

      <transition name="shrink">
        <span v-if="isPlayerMaximized" class="time">{{ timeString }}</span>
      </transition>

      <span class="separator" />

      <transition name="shrink">
        <span
          v-if="isPlayerMaximized && listEntry"
          class="completed button-collapser"
        >
          <transition name="fade">
            <icon
              v-if="listEntry.progress < episode.episodeNumber"
              key="max"
              class="button"
              :icon="bookmarkSvg"
              v-tooltip.top="'Mark as watched'"
              @click.native="setProgress(episode.episodeNumber)"
            />
            <icon
              v-else
              class="button"
              key="min"
              :icon="bookmarkRemoveSvg"
              v-tooltip.top="'Unmark as watched'"
              @click.native="
                setProgress(Math.max(0, episode.episodeNumber - 1))
              "
            />
          </transition>
        </span>
      </transition>

      <transition name="shrink">
        <span
          v-if="isPlayerMaximized"
          class="settings button-collapser"
          :class="{ open: settingsOpen }"
        >
          <icon
            class="button"
            :icon="settingSvg"
            @click.native="toggleSettingsMenu"
          />
        </span>
      </transition>

      <span v-if="!isFullscreen" class="maximize button-collapser">
        <transition name="fade">
          <icon
            v-if="!isPlayerMaximized"
            key="max"
            class="button"
            :icon="maximizeSvg"
            @click.native="maximizePlayer"
          />
          <icon
            v-else
            class="button"
            key="min"
            :icon="minimizeSvg"
            @click.native="$router.back()"
          />
        </transition>
      </span>

      <span class="fullscreen button-collapser">
        <transition name="fade">
          <icon
            v-if="!isFullscreen"
            key="fullscreen"
            class="button"
            :icon="fullscreenSvg"
            @click.native="_toggleFullscreen"
          />
          <icon
            v-else
            class="button"
            key="fullscreenExit"
            :icon="fullscreenExitSvg"
            @click.native="_toggleFullscreen"
          />
        </transition>
      </span>
    </div>

    <transition>
      <div v-if="isPlayerMaximized && settingsOpen" class="settings-menu">
        <label v-if="levels != null">
          Quality:
          <select @input="handleChangeQuality" :value="quality">
            <option v-for="(_, q) in levels" :key="q" :value="q">
              {{ q }}p
            </option>
          </select>
        </label>

        <label v-if="subtitles.length > 0">
          Subtitles:
          <select @input="handleChangeSubtitles" :value="subtitlesIndex">
            <option v-for="(path, q) in subtitles" :key="q" :value="q">
              {{ formatSubtitlePath(path) }}
            </option>
          </select>
        </label>

        <label>
          Speed:
          <select @input="onChangeSpeed" :value="speed">
            <option :value="0.25">0.25x</option>
            <option :value="0.5">0.5x</option>
            <option :value="1">1x</option>
            <option :value="1.5">1.5x</option>
            <option :value="2">2x</option>
          </select>
        </label>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Route } from 'vue-router'
import {
  mdiArrowCollapse,
  mdiArrowExpand,
  mdiBookmark,
  mdiBookmarkRemove,
  mdiClose,
  mdiFullscreen,
  mdiFullscreenExit,
  mdiPause,
  mdiPlay,
  mdiSettingsOutline,
  mdiSkipNext,
  mdiSkipPrevious,
} from '@mdi/js'
import { oc } from 'ts-optchain'

import {
  EpisodeListEpisodes,
  PlayerAnimeAnime,
  PlayerAnimeMediaListEntry,
} from '@/graphql/types'

import { Required } from '@/decorators'
import {
  getIsFullscreen,
  setCurrentEpisode,
  setFullscreen,
  toggleFullscreen,
} from '@/state/app'
import { Levels } from '@/types'
import { secondsToTimeString } from '@/utils'

import Icon from '@/common/components/icon.vue'
import PlayerTitle from './title.vue'
import ProgressBar from './progress-bar.vue'
import VolumeSlider from './volume-slider.vue'

@Component<Controls>({
  components: { PlayerTitle, VolumeSlider, ProgressBar, Icon },
  watch: {
    $route(newRoute: Route) {
      if (!newRoute.path.includes('/player-full') && this.isFullscreen) {
        this._setFullscreen(false)
      }
    },
  },
})
export default class Controls extends Vue {
  @Required(Object) public episode!: EpisodeListEpisodes
  @Prop(Object) public nextEpisode!: EpisodeListEpisodes | null
  @Prop(Object) public anime!: PlayerAnimeAnime | null
  @Required(Boolean) public paused!: boolean
  @Required(Boolean) public muted!: boolean
  @Required(Boolean) public isPlayerMaximized!: boolean
  @Required(Number) public volume!: number
  @Required(Number) public duration!: number
  @Required(Number) public progressInSeconds!: number
  @Required(Number) public progressPercentage!: number
  @Required(Number) public loadedPercentage!: number
  @Required(Number) public speed!: number
  @Required(String) public quality!: string
  @Prop(Object) public levels!: Levels | null
  @Required(Array) public subtitles!: string[]
  @Required(Number) public subtitlesIndex!: number
  @Required(Function) public play!: () => void
  @Required(Function) public pause!: () => void
  @Required(Function) public onSetTime!: (e: Event) => void
  @Required(Function) public onSetVolume!: (e: Event) => void
  @Required(Function) public onToggleMute!: (e: Event) => void
  @Required(Function) public onChangeSpeed!: (e: Event) => void
  @Required(Function) public onChangeQuality!: (quality: string) => void
  @Required(Function) public onChangeSubtitles!: (
    subtitlesIndex: number,
  ) => void
  @Required(Function) public setProgress!: (progress: number) => any
  @Required(Function) public closePlayer!: (progress: number) => any

  public settingsOpen = false
  public hovering = this.settingsOpen || this.paused || false
  public hoveringTimeout: number | null = null

  public settingSvg = mdiSettingsOutline

  public get visible() {
    return this.settingsOpen || this.paused || this.hovering
  }

  public get listEntry(): PlayerAnimeMediaListEntry | null {
    return oc(this).anime.mediaListEntry(null)
  }

  public get timeString() {
    const current = secondsToTimeString(
      Math.min(this.progressInSeconds, this.duration),
    )
    const duration = secondsToTimeString(this.duration)

    return `${current} / ${duration}`
  }

  public get isFullscreen() {
    return getIsFullscreen(this.$store)
  }

  public closeSvg = mdiClose
  public playSvg = mdiPlay
  public pauseSvg = mdiPause
  public prevSvg = mdiSkipPrevious
  public nextSvg = mdiSkipNext
  public bookmarkSvg = mdiBookmark
  public bookmarkRemoveSvg = mdiBookmarkRemove
  public maximizeSvg = mdiArrowExpand
  public minimizeSvg = mdiArrowCollapse
  public fullscreenSvg = mdiFullscreen
  public fullscreenExitSvg = mdiFullscreenExit

  private clickTimeout: number | null = null

  public toggleSettingsMenu() {
    this.settingsOpen = !this.settingsOpen
  }

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

  public handleChangeQuality(e: Event) {
    const element = e.target as HTMLSelectElement
    this.onChangeQuality(element.value)
  }

  public handleChangeSubtitles(e: Event) {
    const element = e.target as HTMLSelectElement
    this.onChangeSubtitles(Number(element.value))
  }

  public formatSubtitlePath(path: string) {
    const match = path.match(/.*[\\/]\d+-\d+-(.*)\.vtt/)

    return match ? match[1].replace(/_/g, ' ').replace(/-/g, '/') : path
  }

  public goVisible() {
    this.hovering = true

    if (this.hoveringTimeout) window.clearTimeout(this.hoveringTimeout)

    this.hoveringTimeout = window.setTimeout(() => {
      this.hovering = false
      this.hoveringTimeout = null
    }, 2000)
  }

  public handleMouseLeave() {
    this.hovering = false

    if (this.hoveringTimeout) window.clearTimeout(this.hoveringTimeout)
  }

  public maximizePlayer() {
    this.$router.push('/player-big')
  }

  public _toggleFullscreen() {
    toggleFullscreen(this.$store)
  }

  public _setFullscreen(value: boolean) {
    setFullscreen(this.$store, value)
  }

  public secondsToTimeString(input: number) {
    return secondsToTimeString(input)
  }

  public go(amount: number) {
    setCurrentEpisode(this.$store, this.episode.index + amount)
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

$buttonSize: 50px;

.button {
  height: $buttonSize;
  width: $buttonSize;
  max-width: $buttonSize;
  padding: 5px;
  margin-top: 5px;

  fill: white;
  cursor: pointer;

  &.disabled {
    pointer-events: none;
    opacity: 0.25;
  }

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

.controls {
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  opacity: 0;
  cursor: none;
  user-select: none;
  transition: opacity 0.15s;

  & > .cover {
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
  }

  & > .button.close {
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 1));
  }

  &.visible {
    opacity: 1;
    cursor: default;
  }

  & .settings-menu {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    bottom: 75px;
    right: 0;
    padding: 10px 15px;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    background: rgba(0, 0, 0, 0.85);
    transition: transform 0.35s;

    & label {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;

      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }

    & select {
      margin-left: 15px;
      background: $main;
      border: none;
      color: $white;
      padding: 3px;
    }

    &.v-enter,
    &.v-leave-to {
      transform: translateX(100%);
    }
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
    &.shrink-enter-active {
      transition: opacity 0.5s ease-in-out, max-width 0.5s ease-in-out,
        padding 0.5s ease-in-out !important;
    }
    &.shrink-leave-active {
      transition: opacity 0.25s, max-width 0.25s, padding 0.25s !important;
    }

    &.shrink-enter,
    &.shrink-leave-to {
      opacity: 0 !important;
      max-width: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
  }

  & > .separator {
    width: 100%;
  }

  & > *:not(.separator) {
    flex-shrink: 0;
  }

  & > *:not(.progress) {
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 1));
  }

  & > .progress {
    filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.75));
  }

  & > .volume-slider {
    margin-top: 5px;
  }

  & > .time {
    padding: 0 12px;
    max-width: 175px;
    opacity: 1;
    overflow: hidden;
    white-space: nowrap;
    font-weight: 400;
    font-size: 1.5em;
    cursor: default;
    font-variant-numeric: tabular-nums;
  }

  & > .button-collapser {
    position: relative;
    display: inline-block;
    flex-shrink: 0;
    height: $buttonSize;
    width: $buttonSize;
    max-width: $buttonSize;
    overflow: hidden;
    margin-top: 5px;

    & > .button {
      margin: 0;
      position: absolute;
      top: 0;
      left: 0;
    }
  }

  & .settings {
    transition: transform 0.35s;

    &.open {
      transform: rotate(-75deg);
    }
  }
}
</style>
