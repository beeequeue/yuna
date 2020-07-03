<template>
  <transition>
    <div v-if="playerData" class="player-container" :class="classes">
      <player
        v-if="playerData.provider !== 'LOCAL'"
        key="player"
        :loading="$apollo.loading || !anime || !episode"
        :anime="anime"
        :episode="episode"
        :next-episode="delayedNextEpisode"
        :should-auto-play="shouldAutoPlay"
        :get-should-auto-mark-watched="shouldAutoMarkWatched"
        :set-progress="toggleProgress"
      />
      <external-player
        v-else-if="anime != null"
        :index="episode.index"
        :episodes="episodes"
        :title="anime.title"
      />
    </div>
  </transition>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from '@vue/composition-api'
import { useQuery, useResult } from '@vue/apollo-composable'

import ExternalPlayer from '@/modules/player/external-player.vue'
import { setProgress } from '@/graphql/mutations/list-entry'
import ANIME_QUERY from './player-anime.graphql'
import { EPISODE_LIST } from '@/graphql/documents/queries'
import {
  EpisodeListEpisodes,
  EpisodeListQuery,
  EpisodeListVariables,
  PlayerAnimeQuery,
  PlayerAnimeVariables,
  Provider,
} from '@/graphql/generated/types'
import { usePlayer } from '@/state/player'
import { getShouldAutoMarkWatched, getShouldAutoPlay } from '@/state/settings'

import Player from './player.vue'
import { PlayerData } from '@/state/app'

export default defineComponent({
  components: { ExternalPlayer, Player },
  setup(_, { root }) {
    const player = usePlayer()
    const id = computed(() => player.current.value?.animeId ?? null)
    const provider = computed(() => player.current.value?.provider ?? null)
    const playerData = computed<PlayerData | null>(() =>
      player.current.value == null
        ? null
        : {
            ...player.current.value,
            id: player.current.value.animeId,
          },
    )

    const animeQuery = useQuery<PlayerAnimeQuery, PlayerAnimeVariables>(
      ANIME_QUERY,
      () => ({
        id: id.value!,
      }),
      () => ({
        enabled: id.value != null,
        throttle: 0,
      }),
    )
    const anime = useResult(animeQuery.result, null)
    const listEntry = useResult(
      animeQuery.result,
      null,
      data => data.anime?.listEntry,
    )

    const episodesQuery = useQuery<EpisodeListQuery, EpisodeListVariables>(
      EPISODE_LIST,
      () => ({
        id: id.value!,
        provider: provider.value!,
      }),
      () => ({
        enabled: id.value != null,
        throttle: 0,
      }),
    )
    const episodes = useResult(
      episodesQuery.result,
      null,
      data => data.episodes,
    )
    const episode = computed(() =>
      player.currentIndex.value == null
        ? null
        : episodes.value?.[player.currentIndex.value] ?? null,
    )
    const nextEpisode = computed(() =>
      player.currentIndex.value == null
        ? null
        : episodes.value?.[player.currentIndex.value + 1] ?? null,
    )
    const delayedNextEpisode = ref<EpisodeListEpisodes | null>(null)

    const timeout = ref<number | null>(null)
    watch(nextEpisode, newEpisode => {
      if (timeout.value != null) {
        clearTimeout(timeout.value)
      }

      timeout.value = window.setTimeout(() => {
        delayedNextEpisode.value = newEpisode
      }, 1000)
    })

    const shouldAutoPlay = computed(() => getShouldAutoPlay(root.$store))
    const shouldAutoMarkWatched = computed(() => {
      return getShouldAutoMarkWatched(root.$store)
    })

    const nicePath = computed(() => root.$route.path.substr(1))
    const classes = computed(() => ({
      [nicePath.value]: true,
      external: episode.value?.provider === Provider.Local,
    }))

    const toggleProgress = () => {
      if (episode.value == null || listEntry.value == null) return

      setProgress(root, {
        animeId: episode.value.animeId,
        episodeNumber:
          episode.value.episodeNumber + (episode.value.isWatched ? -1 : 0),
        provider: episode.value.provider,
      })
    }

    return {
      playerData,

      anime,
      listEntry,

      episodes,
      episode,
      nextEpisode,
      delayedNextEpisode,
      toggleProgress,

      shouldAutoPlay,
      shouldAutoMarkWatched,

      classes,
    }
  },
})
</script>

<style scoped lang="scss">
@import '../../colors';

$anim-speed: 0.5s;

.player-container {
  position: fixed;
  right: 15px;
  bottom: 15px;
  width: 100%;
  height: 100%;
  max-width: 320px;
  max-height: 180px;
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

.external {
  max-height: 50px !important;
}
</style>
