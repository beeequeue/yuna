<template>
  <transition>
    <div v-if="playerData" class="player-container" :class="classFromRoute">
      <player
        key="player"
        :loading="$apollo.loading"
        :episode="episode"
        :nextEpisode="delayedNextEpisode"
        :playerData="playerData"
        :shouldAutoPlay="shouldAutoPlay"
        :getShouldAutoMarkWatched="getShouldAutoMarkWatched"
        :setProgress="setProgress"
      />
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { pathOr } from 'rambdax'

import PLAYER_QUERY from '@/graphql/Player.graphql'
import { setProgressMutation } from '@/graphql/mutations'
import {
  PlayerMediaListEntry,
  PlayerQuery,
  PlayerVariables,
} from '@/graphql/types'

import { Query } from '@/decorators'
import { Page, trackPageView } from '@/lib/tracking'
import { getPlayerData } from '@/state/app'
import { getShouldAutoMarkWatched, getShouldAutoPlay } from '@/state/settings'
import { Episode } from '@/types'

import Player from './Player.vue'

@Component({
  components: { Player },
})
export default class PlayerContainer extends Vue {
  @Query<PlayerContainer, PlayerQuery, PlayerVariables>({
    query: PLAYER_QUERY,
    variables() {
      return {
        id: this.id,
        idMal: this.idMal,
      }
    },
    skip() {
      return !this.id || !this.idMal
    },
  })
  public data: PlayerQuery | null = null

  public delayedNextEpisode: Episode | null = null

  get playerData() {
    return getPlayerData(this.$store)
  }

  get id() {
    if (!this.playerData) return null

    return this.playerData.id
  }

  get idMal() {
    if (!this.playerData) return null

    return this.playerData.idMal
  }

  get episode() {
    const episodes = pathOr(null, ['data', 'episodes'], this)
    const index = pathOr(null, ['playerData', 'index'], this)
    if (!episodes || !index) return null

    return episodes[index]
  }

  get nextEpisode() {
    const episodes = pathOr(null, ['data', 'episodes'], this)
    const index = pathOr(null, ['playerData', 'index'], this)
    if (!episodes || !index) return null

    return episodes[index + 1]
  }

  get listEntry() {
    return pathOr(
      null,
      ['data', 'anime', 'mediaListEntry'],
      this,
    ) as PlayerMediaListEntry | null
  }

  get shouldAutoPlay() {
    return getShouldAutoPlay(this.$store)
  }

  get getShouldAutoMarkWatched() {
    return getShouldAutoMarkWatched(this.$store)
  }

  get classFromRoute() {
    const pathWithoutSlash = this.$route.path.substr(1)

    switch (pathWithoutSlash) {
      case 'player-big':
      case 'player-full':
        trackPageView(Page.PLAYER)
        return pathWithoutSlash
      case 'queue':
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
      this.delayedNextEpisode = this.nextEpisode
    }, 1000)
  }

  public setProgress(progress: number) {
    if (!this.playerData || !this.listEntry) return
    setProgressMutation(this, this.listEntry.id, progress)
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
    max-width $anim-speed, transform 0.25s;

  & > * {
    pointer-events: all;
  }

  &.v-enter,
  &.v-leave-to {
    transform: translateY(110%);
  }
}

.queue {
  max-height: 183px;
  max-width: 325px;
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
