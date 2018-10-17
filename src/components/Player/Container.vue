<template>
<transition name="fade">
  <div
    v-if="episode"
    class="player-container"
    :class="classFromRoute"
  >
    <player
      key="player"
      :episode="episode"
      :nextEpisode="delayedNextEpisode"
      :animeName="playerData.animeName"
      :episodesInAnime="playerData.episodes.length"
    />
  </div>
</transition>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import Player from './Player.vue'

import { getCurrentEpisode, getNextEpisode, getPlayerData } from '@/state/app'
import { Episode } from '@/types'

@Component({
  components: { Player },
})
export default class PlayerContainer extends Vue {
  delayedNextEpisode!: Episode

  get playerData() {
    return getPlayerData(this.$store)
  }

  get episode() {
    return getCurrentEpisode(this.$store)
  }

  get nextEpisode() {
    return getNextEpisode(this.$store)
  }

  get classFromRoute() {
    const pathWithoutSlash = this.$route.path.substr(1)

    switch (pathWithoutSlash) {
      case 'login':
      case 'queue':
      case 'player-big':
      case 'player-full':
        return pathWithoutSlash
      default:
        return 'small'
    }
  }

  public mounted() {
    this.delayedNextEpisode = this.nextEpisode as Episode
  }

  @Watch('nextEpisode')
  public updateDelayedNextEpisode() {
    setTimeout(() => {
      if (!this.nextEpisode) return

      this.delayedNextEpisode = this.nextEpisode
    }, 1000)
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
  z-index: 2;

  background: #050505;
  pointer-events: none;

  will-change: right, bottom, max-height, max-width, opacity;
  transition: right $anim-speed, bottom $anim-speed, max-height $anim-speed,
    max-width $anim-speed, opacity 0.25s;

  & > * {
    pointer-events: all;
  }
}

.login {
  opacity: 0;

  & * {
    pointer-events: none !important;
  }
}

.queue {
  max-height: 170px;
  max-width: 300px;
  right: 0;
  bottom: 0;
}

.player-big {
  bottom: 0;
  right: 0;
  max-height: calc(100% - 80px);
  max-width: 100%;
}

.player-full {
  bottom: 0;
  right: 0;
  max-height: 100%;
  max-width: 100%;
}

.small {
  max-width: 320px;
  max-height: 180px;
  right: 15px;
  bottom: 15px;
}
</style>
