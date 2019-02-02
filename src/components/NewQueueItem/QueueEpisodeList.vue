<template>
  <loading v-if="$apollo.loading" />
  <div
    v-else
    class="queue-episode-list"
    ref="container"
    @wheel.prevent="handleScroll"
    @scroll="() => {}"
  >
    <episode
      v-for="episode in episodes"
      :key="`${episode.name}:${episode.id}`"
      :episode="episode"
      :listEntry="listEntry"
      small
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { pathOr } from 'rambdax'

import {
  EpisodeListEpisodes,
  EpisodeListQuery,
  EpisodeListVariables,
  QueueAnime,
  QueueMediaListEntry,
} from '@/graphql/types'
import EPISODE_LIST from '@/graphql/EpisodeList.graphql'

import { Query, Required } from '@/decorators'
import Episode from '@/components/Episode.vue'
import Loading from '@/components/NewQueueItem/Loading.vue'

@Component({
  components: { Loading, Episode },
})
export default class QueueEpisodeList extends Vue {
  @Required(Object) public anime!: QueueAnime

  @Query<QueueEpisodeList, EpisodeListQuery, EpisodeListVariables>({
    fetchPolicy: 'network-only',
    query: EPISODE_LIST,
    variables() {
      return {
        id: this.anime.id,
      }
    },
    skip() {
      return !this.anime.id
    },
    error(err) {
      if (typeof err === 'string') {
        this.error = err.replace('Network error: ', '')
        return
      }

      if (typeof err.message === 'string') {
        this.error = err.message
        return
      }

      this.error = 'Something went wrong fetching the episodes. :('
    },
  })
  public episodes!: EpisodeListEpisodes[] | null
  public error: string | null = null

  public $refs!: {
    container: HTMLDivElement
  }

  public get listEntry() {
    return pathOr(
      null,
      ['mediaListEntry'],
      this.anime,
    ) as QueueMediaListEntry | null
  }

  public handleScroll(e: WheelEvent) {
    this.$refs.container.scrollBy(e.deltaY + e.deltaX, 0)
  }
}
</script>

<style scoped lang="scss">
.queue-episode-list {
  position: absolute;
  width: 100%;

  display: flex;
  align-items: center;
  padding: 10px;

  overflow: hidden;
  transition: opacity 0.25s;

  &.v-enter,
  &.v-leave-to {
    opacity: 0;
  }
}
</style>
