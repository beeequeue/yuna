<template>
  <loading v-if="loading" />
  <div
    v-else-if="episodes && episodes.length > 0"
    class="queue-episode-list"
    ref="container"
    @wheel.prevent="handleScroll"
  >
    <div class="episode-wrapper">
      <episode
        v-for="episode in episodes"
        :key="`${episode.name}:${episode.id}`"
        ref="episodes"
        :episode="episode"
        :listEntry="listEntry"
        small
      />
    </div>
  </div>
  <source-list v-else :links="anime.externalLinks" />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { pathOr, isNil } from 'rambdax'

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
    episodes: Episode[]
  }

  public get listEntry() {
    return pathOr(
      null,
      ['mediaListEntry'],
      this.anime,
    ) as QueueMediaListEntry | null
  }

  public mounted() {
    this.scrollToNextEpisode()
  }

  public handleScroll(e: WheelEvent) {
    this.$refs.container.scrollBy(e.deltaY + e.deltaX, 0)
  }

  @Watch('episodes')
  public scrollToNextEpisode() {
    if (isNil(this.listEntry)) return

    setTimeout(() => {
      const containerWidth = this.$refs.container.offsetWidth
      const episodeWidth = (this.$refs.episodes[0].$el as HTMLDivElement)
        .offsetWidth
      const nextEpisode =
        this.$refs.episodes[this.listEntry!.progress || 0] ||
        this.$refs.episodes[this.$refs.episodes.length]

      this.$refs.container.scrollTo({
        left:
          (nextEpisode.$el as HTMLDivElement).offsetLeft -
          (containerWidth / 2 - episodeWidth / 2),
        behavior: 'smooth',
      })
    }, 150)
  }
}
</script>

<style scoped lang="scss">
.queue-episode-list {
  position: absolute;
  left: 0;
  right: 0;

  overflow: hidden;
  transition: opacity 0.25s;

  & > .episode-wrapper {
    display: inline-flex;
    align-items: center;
    padding: 15px;
  }

  &.v-enter,
  &.v-leave-to {
    opacity: 0;
  }
}
</style>
