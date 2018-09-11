<template>
  <div class="player-container" :class="classFromRoute">
    <player
      v-if="episode"
      key="player"
      :episode="episode"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Player from './Player.vue'
import { getCurrentEpisode } from '@/state/app'

@Component({
  components: { Player },
})
export default class PlayerContainer extends Vue {
  get episode() {
    return getCurrentEpisode(this.$store)
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
