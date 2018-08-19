<template>
  <div class="list">
    <div style="background: red;">
      <button @click="inc">+</button>
      <button @click="dec">-</button>
    </div>

    <player v-if="streamUrl" :stream="streamUrl"/>
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
  index = 1
  streamUrl: string | null = null
  get episode() {
    return getQueue(this.$store)[this.index] ? getQueue(this.$store)[this.index].episode : null
  }

  @Watch('episode')
  async onEpisodeChange() {
    if (!this.episode) return
    const sessionId = getSessionId(this.$store)
    const streamData = await fetchStream(sessionId, this.episode)

    this.streamUrl = streamData.streams[this.index].url
  }

  inc() {
    if (this.index + 1 < getQueue(this.$store).length) {
      this.index++
      console.log(this.index)
    }
  }

  dec() {
    if (this.index - 1 > -1) {
      this.index--
      console.log(this.index)
    }
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.list {
  height: 100%;
  width: 100%;
}
</style>
