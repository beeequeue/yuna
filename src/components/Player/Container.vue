<template>
  <transition-group class="player-container" :class="classFromRoute" name="lol">
    <player
      v-if="streamUrl"
      key="player"
      :stream="streamUrl"
    />
  </transition-group>
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

    switch(pathWithoutSlash) {
      case('login'):
      case('queue'):
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

.player-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;

  & > * {
    pointer-events: all;
  }
}

.login {
  opacity: 0;
  pointer-events: none;
}

.queue {
  top: auto;
  left: calc(100% - 300px);
}

.small {
  top: 75%;
  left: 75%;
  right: 15px;
  bottom: 15px;
}

.v-move {
  will-change: opacity, transform, top, left;
  transition: opacity 0.1s, transform 0.1s, top 0.1s, left 0.1s;
}
</style>
