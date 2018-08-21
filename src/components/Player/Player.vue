<template>
  <div class="player">
    <video
      preload
      autoplay
      muted
      ref="player"
    />

    <controls v-if="true" :paused="paused" :playOrPause="playOrPause"/>
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
  @Prop(String) public stream?: string
  public paused = false
  public progress = 0
  public progressInSeconds = 0
  public hls = new Hls()

  public $refs!: {
    player: HTMLVideoElement
  }

  public async mounted() {
    this.registerEvents()

    if (Hls.isSupported()) {
      const hls = new Hls()

      hls.attachMedia(this.$refs.player)

      this.hls = hls
    }
  }

  public registerEvents() {
    this.$refs.player.onplay = () => {
      this.paused = false
    }
    this.$refs.player.onpause = () => {
      this.paused = true
    }
  }

  @Watch('stream')
  public onNewStream() {
    if (!this.stream) return

    const hls = new Hls()

    hls.loadSource(this.stream)
    hls.attachMedia(this.$refs.player)

    this.hls = hls
  }

  public playOrPause() {
    this.$refs.player.paused
      ? this.$refs.player.play()
      : this.$refs.player.pause()
  }

  public async goTo() {
    this.$refs.player.currentTime = 0
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.player {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #050505;

  & > video {
    height: 100%;
  }
}
</style>
