<template>
  <div class="player">
    <video
      preload
      :muted="muted"
      :poster="episode.image.large"
      ref="player"
    />

    <transition name="fade">
      <icon v-if="!initiated && loaded" class="uninitiated-icon" :icon="playCircleSvg"/>
    </transition>

    <controls
      :episode="episode"
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
import { mdiPlayCircle } from '@mdi/js'

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
  public paused = true
  public muted = false
  public volume = Number(localStorage.getItem('volume') || 75)
  public progressPercentage = 0
  public progressInSeconds = 0
  public loadedSeconds = 0
  public loadedPercentage = 0
  public hls = new Hls()

  public playCircleSvg = mdiPlayCircle

  public $refs!: {
    player: HTMLVideoElement
  }

  public streamUrl: string = ''

  public async mounted() {
    if (Hls.isSupported()) {
      const hls = new Hls()

      hls.attachMedia(this.$refs.player)
      hls.loadSource(this.streamUrl)

      this.hls = hls
    }

    this.registerEvents()
  }

  public registerEvents() {
    this.$refs.player.onplay = () => {
      this.paused = false
    }
    this.$refs.player.onpause = () => {
      this.paused = true
    }
    this.$refs.player.onprogress = this.onLoadedProgress
    this.$refs.player.ontimeupdate = this.onTimeUpdate

    this.hls.on('hlsFragLoaded', () => {
      this.loaded = true
    })
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

  @Watch('episode')
  public async onNewEpisode() {
    this.streamUrl = (await fetchStream(this.episode.crunchyroll.id)).streams[0].url
    if (!this.streamUrl) return

    this.initiated = false
    this.paused = true

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
}
</script>

<style scoped lang="scss">
@import '../../colors';

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
    transform: translate(-50%, -50%);
    height: 50%;
    fill: $white;
    z-index: 1;
    pointer-events: none;
  }
}
</style>
