<template>
  <div class="player-container" :class="classFromRoute">
    <player
      v-if="streamUrl"
      key="player"
      :stream="streamUrl"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import Player from './Player.vue'
import { getQueue } from '../../state/user'
import { fetchStream } from '../../lib/crunchyroll'
import { getSessionId } from '../../state/auth'

@Component({
  components: { Player },
})
export default class PlayerContainer extends Vue {
  public index = 0
  public streamUrl: string | null = null
  get episode() {
    return getQueue(this.$store)[this.index]
      ? getQueue(this.$store)[this.index].episode
      : null
  }

  get classFromRoute() {
    const pathWithoutSlash = this.$route.path.substr(1)

    switch (pathWithoutSlash) {
      case 'login':
      case 'queue':
        return pathWithoutSlash
      default:
        return 'small'
    }
  }

  @Watch('episode')
  public async onEpisodeChange() {
    if (!this.episode) return
    const sessionId = getSessionId(this.$store)
    const streamData = await fetchStream(sessionId, this.episode)

    this.streamUrl = streamData.streams[this.index].url
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

$anim-speed: 0.5s;

.player-container {
  position: fixed;
  width: 100%;
  height: 100%;

  background: #050505;
  pointer-events: none;

  will-change: right, bottom, max-height, max-width;
  transition: right $anim-speed, bottom $anim-speed, max-height $anim-speed,
    max-width $anim-speed;

  & > * {
    pointer-events: all;
  }
}

.login {
  opacity: 0;
  pointer-events: none;
}

.queue {
  max-height: 170px;
  max-width: 300px;
  right: 0;
  bottom: 0;
}

.small {
  max-width: 320px;
  max-height: 180px;
  right: 15px;
  bottom: 15px;
}
</style>
