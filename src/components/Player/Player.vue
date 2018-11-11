<template>
  <div
    class="player"
    tabindex="0"
    @keydown="onKeyDown"
    @keydown.escape.prevent="isFullscreen ? toggleFullscreen() : null"
    @wheel.capture="onScroll"
  >
    <video
      preload
      :muted="muted"
      :autoplay="shouldAutoPlay"
      :poster="episode.thumbnail"
      ref="player"
      :class="{ ended }"
    />

    <transition name="fade">
      <icon v-if="!initiated && loaded" class="uninitiated-icon" :icon="playCircleSvg"/>
    </transition>

    <transition name="fade">
      <span class="loading-spinner">
        <icon
          v-if="loading"
          :icon="loadingSvg"
        />
      </span>
    </transition>

    <controls
      :episode="episode"
      :animeName="animeName"
      :animeId="animeId"
      :listEntry="listEntry"
      :loading="loading"
      :paused="paused"
      :isPlayerMaximized="isPlayerMaximized"
      :muted="muted"
      :volume="volume"
      :progressPercentage="progressPercentage"
      :progressInSeconds="progressInSeconds"
      :loadedPercentage="loadedPercentage"
      :onSetTime="onSetTime"
      :onSetVolume="onSetVolume"
      :onToggleMute="onToggleMute"
      :play="play"
      :pause="pause"
      :setProgress="setProgress"
    />

    <next-episode-overlay
      v-if="ended && nextEpisode"
      :nextEpisode="nextEpisode"
      :episodesInAnime="episodesInAnime"
      :isPlayerMaximized="isPlayerMaximized"
      :shouldAutoPlay="shouldAutoPlay"
    />

    <end-of-season-overlay
      v-if="ended && !nextEpisode"
      :sequels="sequels"
      :episodesInAnime="episodesInAnime"
      :isPlayerMaximized="isPlayerMaximized"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import Hls from 'hls.js'
import { contains } from 'rambda'
import { mdiLoading, mdiPlayCircle } from '@mdi/js'

import { fetchStream, setProgressOfEpisode } from '@/lib/crunchyroll'
import {
  getIsFullscreen,
  sendErrorToast,
  toggleFullscreen,
  ListEntry,
  Sequel,
} from '@/state/app'
import { getKeydownHandler, KeybindingAction } from '@/state/settings'
import { Episode } from '@/types'
import { prop } from '@/utils'

import Icon from '../Icon.vue'
import Controls from './Controls.vue'
import NextEpisodeOverlay from './NextEpisodeOverlay.vue'
import EndOfSeasonOverlay from './EndOfSeasonOverlay.vue'

@Component({
  components: { Controls, EndOfSeasonOverlay, Icon, NextEpisodeOverlay },
})
export default class Player extends Vue {
  @Prop(Object) public episode!: Episode
  @Prop(Object) public nextEpisode!: Episode
  @Prop(prop(Array, true))
  public sequels!: Sequel[]
  @Prop(Number) public animeId!: number
  @Prop(String) public animeName!: string
  @Prop(prop(Number, true))
  public episodesInAnime!: number
  @Prop(Object) public listEntry?: ListEntry
  @Prop(Boolean) public shouldAutoPlay?: boolean
  @Prop(Boolean) public getShouldAutoMarkWatched?: boolean
  @Prop(prop(Function, true))
  public setProgress!: (p: number) => any

  public initiated = !!this.shouldAutoPlay
  public ended = false
  // Gotten to the 'soft end' - e.g. 80% of the way
  public softEnded = false
  public loaded = false
  public loading = false
  public paused = true
  public muted = !!localStorage.getItem('muted')
  public volume = Number(localStorage.getItem('volume') || 75)
  public progressPercentage = 0
  public progressInSeconds = 0
  public loadedSeconds = 0
  public loadedPercentage = 0

  // Crunchyroll scrobbling
  private lastScrobble = 0

  public hls = new Hls()

  public playCircleSvg = mdiPlayCircle
  public loadingSvg = mdiLoading

  public get isPlayerMaximized() {
    return contains(this.$route.path, ['/player-big', '/player-full'])
  }

  private get actionFunctionMap() {
    return {
      [KeybindingAction.PAUSE]: () => this.pause(),
      [KeybindingAction.PLAY]: () => this.pause(),
      [KeybindingAction.PAUSE_PLAY]: () =>
        this.paused ? this.play() : this.pause(),
      [KeybindingAction.SKIP_BACK]: () => this.skipBySeconds(-5),
      [KeybindingAction.SKIP_FORWARD]: () => this.skipBySeconds(5),
      [KeybindingAction.VOLUME_DOWN]: () => this.increaseVolume(-10),
      [KeybindingAction.VOLUME_UP]: () => this.increaseVolume(10),
      [KeybindingAction.TOGGLE_MUTED]: () => this.onToggleMute(),
      [KeybindingAction.TOGGLE_FULLSCREEN]: () => this.toggleFullscreen(),
    }
  }

  private get keyDownHandler() {
    return getKeydownHandler(this.$store)(this.actionFunctionMap)
  }

  public get isFullscreen() {
    return getIsFullscreen(this.$store)
  }

  public $refs!: {
    player: HTMLVideoElement
  }

  public streamUrl: string | null = null

  public mounted() {
    this.onNewEpisode()
  }

  public registerEvents() {
    this.$refs.player.onplay = () => {
      this.paused = false
    }
    this.$refs.player.onpause = () => {
      this.paused = true
    }
    this.$refs.player.oncanplay = () => {
      this.loading = false
      this.loaded = true
    }
    this.$refs.player.onwaiting = () => {
      this.loading = true
    }

    this.$refs.player.onprogress = this.onLoadedProgress
    this.$refs.player.ontimeupdate = this.onTimeUpdate
    this.$refs.player.addEventListener('ended', this.onEnded)
  }

  public onLoadedProgress(e: Event) {
    const element = e.target as HTMLVideoElement
    this.loadedSeconds = element.buffered.end(0)
    this.loadedPercentage = this.loadedSeconds / this.episode.duration
  }

  public onTimeUpdate(e: Event) {
    const element = e.target as HTMLVideoElement

    if (this.ended) {
      this.ended = false
    }

    this.progressInSeconds = Math.round(element.currentTime)
    this.progressPercentage = element.currentTime / this.episode.duration

    if (
      this.progressInSeconds % 10 === 0 &&
      this.lastScrobble < this.progressInSeconds
    ) {
      this.lastScrobble = this.progressInSeconds

      setProgressOfEpisode(this.episode.crunchyroll.id, this.progressInSeconds)
    }

    if (!this.softEnded && this.progressPercentage >= 0.8) {
      this.softEnded = true
      this.lastScrobble = this.episode.duration

      setProgressOfEpisode(this.episode.crunchyroll.id, this.episode.duration)
      this.updateProgressIfNecessary()
    }
  }

  public onEnded() {
    this.ended = true
    this.softEnded = true

    this.updateProgressIfNecessary()
  }

  public onSetTime(e: Event) {
    const element = e.target as HTMLInputElement

    this.$refs.player.currentTime = Number(element.value)
  }

  public onSetVolume(e: Event) {
    const element = e.target as HTMLInputElement

    this.volume = Number(element.value)
    localStorage.setItem('volume', element.value)

    this.$refs.player.volume = Number(element.value) / 100
  }

  public onToggleMute() {
    this.muted = !this.muted

    localStorage.setItem('muted', this.muted.toString())
  }

  public onKeyDown(e: KeyboardEvent) {
    return this.keyDownHandler(e.key)
  }

  public onScroll(e: WheelEvent) {
    const direction = e.deltaY / -100

    this.increaseVolume(10 * direction)
  }

  @Watch('episode')
  public async onNewEpisode() {
    this.pause()

    try {
      this.streamUrl = (await fetchStream(
        this.episode.crunchyroll.id,
      )).streams[0].url
    } catch (e) {
      return sendErrorToast(this.$store, e)
    }

    if (!this.streamUrl) return

    this.progressInSeconds = 0
    this.progressPercentage = 0
    this.ended = false
    this.softEnded = false
    this.initiated = !!this.shouldAutoPlay
    this.paused = true
    this.loading = true
    this.loaded = false

    const hls = new Hls()

    hls.loadSource(this.streamUrl)
    hls.attachMedia(this.$refs.player)

    this.hls = hls

    this.registerEvents()
  }

  public play() {
    if (this.paused) {
      if (!this.initiated) this.initiated = true

      this.$refs.player.play()
    }
  }

  public pause() {
    if (!this.paused) this.$refs.player.pause()
  }

  public increaseVolume(n: number) {
    this.onSetVolume({
      target: {
        value: Math.min(100, Math.max(0, this.volume + n)),
      },
    } as any)
  }

  public skipBySeconds(n: number) {
    this.$refs.player.currentTime += n
  }

  public toggleFullscreen() {
    toggleFullscreen(this.$store)
  }

  public updateProgressIfNecessary() {
    if (
      !this.listEntry ||
      !this.getShouldAutoMarkWatched ||
      this.listEntry.progress >= this.episode.episodeNumber
    ) {
      return
    }

    this.setProgress(this.episode.episodeNumber)
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

@keyframes spin {
  from {
    transform: rotateZ(0deg);
  }
  to {
    transform: rotateZ(360deg);
  }
}

.player {
  position: relative;
  width: 100%;
  height: 100%;
  box-shadow: $shadow;
  overflow: hidden;

  & > video {
    background: #050505;
    width: 100%;
    height: 100%;
    transition: filter 1s;

    &.ended {
      filter: blur(10px);
    }
  }

  & > .uninitiated-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 40%;
    fill: $white;
    filter: drop-shadow(1px 2px 3px black);
    transform: translate(-50%, -50%);
    z-index: 1;
    pointer-events: none;
  }

  & > .loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 40%;
    pointer-events: none;
    fill: $white;
    filter: drop-shadow(1px 2px 3px black);
    transform: translate(-50%, -50%);

    & > .icon {
      height: 100%;
      width: 100%;
      animation: spin 1s linear;
      animation-iteration-count: infinite;
    }
  }
}
</style>
