<template>
  <div
    class="player"
    tabindex="0"
    @keydown.space="paused ? play() : pause()"
    @keydown.up="increaseVolume(5)"
    @keydown.down="increaseVolume(-5)"
    @keydown.m="onToggleMute"
    @keydown.right="skipBySeconds(5)"
    @keydown.left="skipBySeconds(-5)"
    @wheel.capture="onScroll"
  >
    <video
      preload
      :muted="muted"
      :poster="episode.image.large"
      ref="player"
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
      :loading="loading"
      :paused="paused"
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
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import Hls from 'hls.js'
import { mdiLoading, mdiPlayCircle } from '@mdi/js'

import Icon from '../Icon.vue'
import Controls from './Controls.vue'
import { Episode } from '../../types'
import { fetchStream } from '../../lib/crunchyroll'

@Component({
  components: { Controls, Icon },
})
export default class Player extends Vue {
  @Prop() public episode!: Episode
  public initiated = false
  public loaded = false
  public loading = false
  public paused = true
  public muted = false
  public volume = Number(localStorage.getItem('volume') || 75)
  public progressPercentage = 0
  public progressInSeconds = 0
  public loadedSeconds = 0
  public loadedPercentage = 0
  public hls = new Hls()

  public playCircleSvg = mdiPlayCircle
  public loadingSvg = mdiLoading

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
  }

  public onLoadedProgress(e: Event) {
    const element = e.target as HTMLVideoElement
    this.loadedSeconds = element.buffered.end(0)
    this.loadedPercentage = this.loadedSeconds / this.episode.duration
  }

  public onTimeUpdate(e: Event) {
    const element = e.target as HTMLVideoElement
    this.progressInSeconds = Math.round(element.currentTime)
    this.progressPercentage = element.currentTime / this.episode.duration
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
  }

  public onScroll(e: WheelEvent) {
    const direction = e.deltaY / -100

    this.increaseVolume(10 * direction)
  }

  @Watch('episode')
  public async onNewEpisode() {
    this.initiated = false
    this.paused = true
    this.loading = true
    this.loaded = false

    this.streamUrl = (await fetchStream(
      this.episode.crunchyroll.id,
    )).streams[0].url
    if (!this.streamUrl) return

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
  overflow: hidden;

  & > video {
    background: #050505;
    width: 100%;
    height: 100%;
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
