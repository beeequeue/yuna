<template>
  <transition>
    <div v-if="playerData" class="player-container" :class="classFromRoute">
      <player
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
import EPISODE_LIST from '@/graphql/EpisodeList.graphql'
import { setEpisodeUnwatched, setEpisodeWatched } from '@/graphql/mutations'
import {
  PlayerAnimeAnime,
  PlayerAnimeMediaListEntry,
  PlayerAnimeQuery,
  PlayerAnimeVariables,
  EpisodeListEpisodes,
  EpisodeListQuery,
  EpisodeListVariables,
} from '@/graphql/types'

import { Query } from '@/decorators'
import { Page, trackPageView } from '@/lib/tracking'
import { getPlayerData } from '@/state/app'
import { getShouldAutoMarkWatched, getShouldAutoPlay } from '@/state/settings'

import Player from './Player.vue'

@Component({ components: { Player } })
export default class PlayerContainer extends Vue {
  @Query<PlayerContainer, PlayerAnimeQuery, PlayerAnimeVariables>({
    fetchPolicy: 'network-only',
    query: ANIME_QUERY,
    variables() {
      return {
        id: this.id,
      }
    },
    skip() {
      return !this.id
    },
  })
  public anime: PlayerAnimeAnime | null = null

  @Query<PlayerContainer, EpisodeListQuery, EpisodeListVariables>({
    query: EPISODE_LIST,
    variables() {
      return {
        id: this.id,
        provider: this.playerData.provider,
      }
    },
    skip() {
      return !this.id
    },
  })
  public episodes: EpisodeListEpisodes[] | null = null

  public delayedNextEpisode: EpisodeListEpisodes | null = null

  get playerData() {
    return getPlayerData(this.$store)
  }

  get id() {
    const data = getPlayerData(this.$store)
    if (!data) return null

    return data.id
  }

  get episode() {
    const index = pathOr(null, ['playerData', 'index'], this)
    if (isNil(this.episodes) || isNil(index)) return null

    return this.episodes[index] as EpisodeListEpisodes
  }

  get nextEpisode() {
    const index = pathOr(null, ['playerData', 'index'], this)
    if (isNil(this.episodes) || isNil(index)) return null

    return this.episodes[index + 1] as EpisodeListEpisodes
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
    this.delayedNextEpisode = this.nextEpisode as EpisodeListEpisodes
  }

  @Watch('id')
  public clear() {
    if (this.anime) {
      this.anime = null
    }

    if (this.episodes) {
      this.episodes = null
    }
  }

  @Watch('nextEpisode')
  public updateDelayedNextEpisode() {
    setTimeout(() => {
      this.delayedNextEpisode = this.nextEpisode
    }, 1000)
  }

  public setProgress() {
    if (!this.episode || !this.listEntry) return

    if (!this.episode.isWatched) {
      setEpisodeWatched(this, this.episode, this.listEntry as any)
    } else {
      setEpisodeUnwatched(this, this.episode, this.listEntry as any)
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
