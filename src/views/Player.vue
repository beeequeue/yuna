<template>
  <div class="list">
    <div class="player-container">
      <player v-if="streamUrl" :stream="streamUrl"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import Player from '../components/Player/Player.vue'
import { getQueue } from '../state/user'
import { fetchStream } from '../lib/crunchyroll'
import { getSessionId } from '../state/auth'

@Component({
  components: { Player },
})
export default class PlayerContainer extends Vue {
  public index = 1
  public streamUrl: string | null = null
  get episode() {
    return getQueue(this.$store)[this.index] ? getQueue(this.$store)[this.index].episode : null
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
@import '../colors';

.list {
  height: 100%;
  width: 100%;
}

.player-container {
  position: relative;
  height: 100%;
  width: 100%;
}
</style>
