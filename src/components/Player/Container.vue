<template>
  <transition>
    <div v-if="playerData" class="player-container" :class="classFromRoute">
      <player
        v-if="anime"
        key="player"
        :loading="$apollo.loading || !anime || !episode"
        :anime="anime"
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
import { isNil, pathOr } from 'rambdax'

import ANIME_QUERY from '@/graphql/PlayerAnime.graphql'
import EPISODES_QUERY from '@/graphql/PlayerEpisodes.graphql'
import { setProgressMutation } from '@/graphql/mutations'
import {
  PlayerAnimeAnime,
  PlayerAnimeMediaListEntry,
  PlayerAnimeQuery,
  PlayerAnimeVariables,
  PlayerEpisodesEpisodes,
  PlayerEpisodesQuery,
  PlayerEpisodesVariables,
} from '@/graphql/types'

import { Query } from '@/decorators'
import { Page, trackPageView } from '@/lib/tracking'
import { getPlayerData } from '@/state/app'
import { getShouldAutoMarkWatched, getShouldAutoPlay } from '@/state/settings'

import Player from './Player.vue'

@Component({
  components: { Player },
})
export default class PlayerContainer extends Vue {
  @Query<PlayerContainer, PlayerAnimeQuery, PlayerAnimeVariables>({
    query: ANIME_QUERY,
    variables() {
      return {
        id: this.id,
        idMal: this.idMal,
      }
    },
    skip() {
      return !this.id || !this.idMal
    },
    update: data => data.anime,
  })
  public anime: PlayerAnimeAnime | null = null

  @Query<PlayerContainer, PlayerEpisodesQuery, PlayerEpisodesVariables>({
    query: EPISODES_QUERY,
    variables() {
      return {
        idMal: this.idMal,
      }
    },
    skip() {
      return !this.idMal
    },
    update: data => data.episodes,
  })
  public episodes: PlayerEpisodesEpisodes[] | null = null

  public delayedNextEpisode: PlayerEpisodesEpisodes | null = null

  get playerData() {
    return getPlayerData(this.$store)
  }

  get id() {
    const data = getPlayerData(this.$store)
    if (!data) return null

    return data.id
  }

  get idMal() {
    const data = getPlayerData(this.$store)
    if (!data) return null

    return data.idMal
  }

  get episode() {
    const index = pathOr(null, ['playerData', 'index'], this)
    if (isNil(this.episodes) || isNil(index)) return null

    return this.episodes[index] as PlayerEpisodesEpisodes
  }

  get nextEpisode() {
    const index = pathOr(null, ['playerData', 'index'], this)
    if (!this.episodes || !index) return null

    return this.episodes[index + 1] as PlayerEpisodesEpisodes
  }

  get listEntry() {
    return pathOr(
      null,
      ['anime', 'mediaListEntry'],
      this,
    ) as PlayerAnimeMediaListEntry | null
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
    this.delayedNextEpisode = this.nextEpisode as PlayerEpisodesEpisodes
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
