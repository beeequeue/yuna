<template>
  <loading v-if="loading" />
  <div
    v-else-if="episodes && episodes.length > 0"
    class="queue-episode-list"
    ref="container"
    @wheel.prevent="handleScroll"
  >
    <episode
      v-for="episode in episodes"
      :key="`${episode.name}:${episode.id}`"
      :episode="episode"
      :listEntry="listEntry"
      small
    />
  </div>
  <source-list v-else :links="anime.externalLinks" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { pathOr } from 'rambdax'

import {
  EpisodeListEpisodes,
  QueueAnime,
  QueueMediaListEntry,
} from '@/graphql/types'

import { Default, Required } from '@/decorators'
import Episode from '@/components/Episode.vue'
import Loading from '@/components/NewQueueItem/Loading.vue'
import SourceList from '@/components/SourceList.vue'

@Component({ components: { SourceList, Loading, Episode } })
export default class QueueEpisodeList extends Vue {
  @Required(Object) public anime!: QueueAnime
  @Default(Array, [])
  public episodes!: EpisodeListEpisodes[]
  @Prop(String) public error!: string | null
  @Default(Boolean, false)
  public loading!: boolean

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
  padding: 15px;

  overflow: hidden;
  transition: opacity 0.25s;

  &.v-enter,
  &.v-leave-to {
    opacity: 0;
  }
}
</style>
