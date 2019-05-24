<template>
  <transition>
    <div v-if="playerData" class="player-container" :class="classFromRoute">
      <player
        v-if="playerData.provider !== 'LOCAL'"
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
      <external-player
        v-else-if="anime != null"
        :index="this.episode.index"
        :episodes="episodes"
        :title="anime.title"
      />
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { oc } from 'ts-optchain'

import ExternalPlayer from '@/modules/player/external-player.vue'
import { setProgress } from '@/common/mutations/episodes'
import ANIME_QUERY from './player-anime.graphql'
import EPISODE_LIST from '@/common/queries/episode-list.graphql'
import {
  EpisodeListEpisodes,
  EpisodeListQuery,
  EpisodeListVariables,
  PlayerAnimeAnime,
  PlayerAnimeQuery,
  PlayerAnimeVariables,
  Provider,
} from '@/graphql/types'

import { Query } from '@/decorators'
import { getPlayerData } from '@/state/app'
import { getShouldAutoMarkWatched, getShouldAutoPlay } from '@/state/settings'
import { isNil } from '@/utils'

import Player from './player.vue'

@Component({ components: { ExternalPlayer, Player } })
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
    const index = oc(this.playerData).index(-1)

    return oc(this.episodes)[index]() || null
  }

  get nextEpisode() {
    const index = oc(this.playerData).index()
    if (isNil(this.episodes) || isNil(index)) return null

    return this.episodes[index + 1] as EpisodeListEpisodes
  }

  get listEntry() {
    return oc(this.anime).mediaListEntry(null)
  }

  get shouldAutoPlay() {
    return getShouldAutoPlay(this.$store)
  }

  get getShouldAutoMarkWatched() {
    return getShouldAutoMarkWatched(this.$store)
  }

  get classFromRoute() {
    let classNames = []

    if (oc(this.episode).provider() === Provider.Local) {
      classNames.push('external')
    }

    const pathWithoutSlash = this.$route.path.substr(1)

    switch (pathWithoutSlash) {
      case 'player-big':
      case 'player-full':
        classNames.push(pathWithoutSlash)
        break
      case 'queue':
        classNames.push(pathWithoutSlash)
        break
      default:
        classNames.push('small')
    }

    return classNames.join(' ')
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
      setProgress(this, { ...this.episode, ...this.listEntry })
    } else {
      setProgress(this, {
        ...this.episode,
        episodeNumber: this.episode.episodeNumber - 1,
        ...this.listEntry,
      })
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

.external {
  max-height: 50px !important;
}
</style>
