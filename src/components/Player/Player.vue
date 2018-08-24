<template>
  <div class="player">
    <video
      preload
      muted
      ref="player"
    />

    <transition name="fade">
      <icon v-if="!initiated && loaded" class="uninitiated-icon" :icon="playCircleSvg"/>
    </transition>

    <controls :paused="paused" :playOrPause="playOrPause"/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import Hls from 'hls.js'
import { mdiPlayCircle } from '@mdi/js'

import Icon from '../Icon.vue'
import Controls from './Controls.vue'

@Component({
  components: { Controls, Icon },
})
export default class Player extends Vue {
  @Prop(String) public stream!: string
  public initiated = false
  public loaded = false
  public paused = true
  public progress = 0
  public progressInSeconds = 0
  public hls = new Hls()

  public playCircleSvg = mdiPlayCircle

  public $refs!: {
    player: HTMLVideoElement
  }

  public async mounted() {
    if (Hls.isSupported()) {
      const hls = new Hls()

      hls.attachMedia(this.$refs.player)
      hls.loadSource(this.stream)

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
    this.hls.on('hlsFragLoaded', () => {
      this.loaded = true
    })
  }

  @Watch('stream')
  public onNewStream() {
    if (!this.stream) return

    const hls = new Hls()

    hls.loadSource(this.stream)
    hls.attachMedia(this.$refs.player)

    this.hls = hls

    this.registerEvents()
  }

  public playOrPause() {
    if (this.paused) {
      if (!this.initiated) this.initiated = true

      this.$refs.player.play()
    } else {
      this.$refs.player.pause()
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.player {
  /*width: 100%;*/
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
    fill: $gray;
    z-index: 1;
    pointer-events: none;
  }
}
</style>
