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
      <span v-if="loading" class="loading-spinner">
        <icon :icon="loadingSvg"/>
      </span>
    </transition>

    <controls
      :episode="episode"
      :nextEpisode="nextEpisode"
      :animeName="playerData.anime.title"
      :animeId="playerData.anime.id"
      :listEntry="playerData.listEntry"
      :loading="loading"
      :paused="paused"
      :isPlayerMaximized="isPlayerMaximized"
      :muted="muted"
      :volume="volume"
      :progressPercentage="progressPercentage"
      :progressInSeconds="progressInSeconds"
      :loadedPercentage="loadedPercentage"
      :speed="speed"
      :quality="quality"
      :levels="levels"
      :onSetTime="onSetTime"
      :onSetVolume="onSetVolume"
      :onToggleMute="onToggleMute"
      :onChangeSpeed="onChangeSpeed"
      :onChangeQuality="onChangeQuality"
      :play="play"
      :pause="pause"
      :setProgress="setProgress"
    />

    <next-episode-overlay
      v-if="ended && nextEpisode"
      :nextEpisode="nextEpisode"
      :episodesInAnime="playerData.anime.episodes"
      :progress="playerData.listEntry.progress"
      :isPlayerMaximized="isPlayerMaximized"
      :shouldAutoPlay="shouldAutoPlay"
    />

    <end-of-season-overlay
      v-if="ended && !nextEpisode"
      :listEntry="playerData.listEntry"
      :sequels="playerData.anime.sequels"
      :episodeNumber="episode.episodeNumber"
      :episodesInAnime="playerData.anime.episodes"
      :nextAiringEpisode="playerData.anime.nextAiringEpisode"
      :isPlayerMaximized="isPlayerMaximized"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import Hls from 'hls.js'
import { contains } from 'rambdax'
import { mdiLoading, mdiPlayCircle } from '@mdi/js'

import { fetchStream, setProgressOfEpisode } from '@/lib/crunchyroll'
import { trackStillWatching } from '@/lib/tracking'
import {
  getIsFullscreen,
  PlayerData,
  sendErrorToast,
  toggleFullscreen,
} from '@/state/app'
import { getKeydownHandler, KeybindingAction } from '@/state/settings'
import { Episode, Levels } from '@/types'
import { clamp, prop } from '@/utils'

import Icon from '../Icon.vue'
import Controls from './Controls.vue'
import NextEpisodeOverlay from './NextEpisodeOverlay.vue'
import EndOfSeasonOverlay from './EndOfSeasonOverlay.vue'

interface Level {
  attrs: {
    BANDWIDTH: number
    CODECS: string
    'FRAME-RATE': string
    'PROGRAM-ID': string
    RESOLUTION: string
  }
  bitrate: number
  details: {}
  name?: string
  height: number
  width: number
  level: number
  audioCodec: string
  videoCodec: string
  unknownCodecs: any[]
  urls: string[]
  urlId: number
  fragmentError: boolean
  loadError: number
}

@Component({
  components: { Controls, EndOfSeasonOverlay, Icon, NextEpisodeOverlay },
})
export default class Player extends Vue {
  @Prop(Object) public episode!: Episode
  @Prop(Object) public nextEpisode!: Episode
  @Prop(prop(Object, true))
  public playerData!: PlayerData
  @Prop(Boolean) public shouldAutoPlay!: boolean | null
  @Prop(Boolean) public getShouldAutoMarkWatched?: boolean
  @Prop(prop(Function, true))
  public setProgress!: (p: number) => any

  public streamUrl: string | null = null
  public levels: Levels | null = null

  public initiated = !!this.shouldAutoPlay
  public ended = false
  // Gotten to the 'soft end' - e.g. 80% of the way
  public softEnded = false
  public loaded = false
  public loading = false
  public paused = true
  public muted = localStorage.getItem('muted') === 'true'
  public volume = Number(localStorage.getItem('volume') || 0.7)
  public speed = Number(localStorage.getItem('speed') || 1)
  public quality: number = Number(localStorage.getItem('quality') || -1)
  public progressPercentage = 0
  public progressInSeconds = 0
  public playhead = 0
  public loadedSeconds = 0
  public loadedPercentage = 0

  private lastScrobble = 0
  private lastHeartbeat = 0

  public hls = new Hls()

  // Volume
  private gainNode: GainNode | null = null

  public playCircleSvg = mdiPlayCircle
  public loadingSvg = mdiLoading

  public $refs!: {
    player: HTMLVideoElement
  }

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
      [KeybindingAction.VOLUME_DOWN]: () => this.increaseVolume(-0.1),
      [KeybindingAction.VOLUME_UP]: () => this.increaseVolume(0.1),
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

  public mounted() {
    this.onNewEpisode()

    const audioContext = new AudioContext()
    this.gainNode = audioContext.createGain()
    this.gainNode.gain.value = this.volume

    audioContext
      .createMediaElementSource(this.$refs.player)
      .connect(this.gainNode)

    this.gainNode.connect(audioContext.destination)
  }

  @Watch('episode')
  public async onNewEpisode() {
    this.pause()

    try {
      const { url, progress } = await fetchStream(this.episode.crunchyroll.id)

      this.streamUrl = url

      this.playhead = progress
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

  public registerEvents() {
    this.hls.on('hlsManifestParsed', (_event, data) => {
      let i = 0
      const qualities = (data.levels as any).reduce(
        (map: any, level: Level) => {
          map[level.height.toString()] = i
          i++

          return map
        },
        {} as any,
      )

      this.levels = qualities
      this.hls.loadLevel = this.quality
    })

    this.hls.on('hlsMediaAttached', () => {
      this.$refs.player.currentTime =
        this.playhead < this.episode.duration * 0.8 ? this.playhead : 0
    })

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

    if (
      this.progressInSeconds % 60 === 0 &&
      this.lastHeartbeat < this.progressInSeconds
    ) {
      this.lastHeartbeat = this.progressInSeconds

      trackStillWatching()
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

  public onSetTime(value: number) {
    this.lastHeartbeat = this.progressInSeconds - 30

    this.$refs.player.currentTime = value
  }

  public onSetVolume(e: Event) {
    if (!this.gainNode) return

    const element = e.target as HTMLInputElement

    const value = clamp(+Number(element.value).toFixed(2), 0, 2)

    this.volume = value
    localStorage.setItem('volume', value.toString())

    this.gainNode.gain.value = value
  }

  public onToggleMute() {
    this.muted = !this.muted

    localStorage.setItem('muted', this.muted.toString())
  }

  public onChangeSpeed(e: Event) {
    const { value } = e.target as HTMLSelectElement

    this.speed = Number(value)
    this.$refs.player.playbackRate = this.speed
  }

  public onChangeQuality(quality: number) {
    this.quality = quality
    this.hls.currentLevel = quality
    localStorage.setItem('quality', quality.toString())
  }

  public onKeyDown(e: KeyboardEvent) {
    return this.keyDownHandler(e.key)
  }

  public onScroll(e: WheelEvent) {
    const direction = Math.sign(-e.deltaY)

    this.increaseVolume(direction / 10)
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
    this.onSetTime(this.$refs.player.currentTime + n)
  }

  public toggleFullscreen() {
    toggleFullscreen(this.$store)
  }

  public updateProgressIfNecessary() {
    if (
      !this.playerData.listEntry ||
      !this.getShouldAutoMarkWatched ||
      this.playerData.listEntry.progress >= this.episode.episodeNumber
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
