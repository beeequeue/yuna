<template>
  <div class="player">
    <video
      preload
      autoplay
      muted
      ref="player"
    />

    <controls :paused="paused" :playOrPause="playOrPause"/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import Hls from 'hls.js'

import Icon from '../Icon.vue'
import Controls from './Controls.vue'

@Component({
  components: { Controls, Icon },
})
export default class Player extends Vue {
  @Prop(String) stream?: string
  paused = false
  progress = 0
  progressInSeconds = 0
  hls = new Hls()

  async mounted() {
    this.registerEvents()

    if (Hls.isSupported()) {
      const hls = new Hls()

      hls.attachMedia(this.$refs.player)

      this.hls = hls
    }
  }

  registerEvents() {
    this.$refs.player.onplay = () => {
      this.paused = false
    }
    this.$refs.player.onpause = () => {
      this.paused = true
    }
  }

  @Watch('stream')
  onNewStream() {
    if (!this.stream) return

    const hls = new Hls()

    hls.loadSource(this.stream)
    hls.attachMedia(this.$refs.player)

    this.hls = hls
  }

  playOrPause() {
    this.$refs.player.paused
      ? this.$refs.player.play()
      : this.$refs.player.pause()
  }

  async goTo() {
    this.$refs.player.currentTime = 0
  }

  $refs!: {
    player: HTMLVideoElement
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.player {
  position: absolute;
  width: 900px;
  height: 506px;

  & > video {
    height: 100%;
  }
}
</style>
