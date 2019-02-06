<template>
  <loading v-if="loading" />
  <div
    v-else-if="episodes && episodes.length > 0"
    class="episode-list"
    ref="container"
    @wheel.prevent="handleScroll"
  >
    <div class="episode-wrapper" :class="{ 'pad-right': !!padRight }">
      <episode
        v-for="episode in episodes"
        :key="`${episode.name}:${episode.id}`"
        ref="episodes"
        :episode="episode"
        :listEntry="listEntry"
        :small="small"
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

import { Required } from '@/decorators'
import Episode from '@/components/Episode.vue'
import Loading from '@/components/QueueItem/Loading.vue'
import SourceList from '@/components/SourceList.vue'

@Component({ components: { SourceList, Loading, Episode } })
export default class QueueEpisodeList extends Vue {
  @Required(Object) public anime!: QueueAnime
  @Prop(Array) public episodes!: EpisodeListEpisodes[] | null
  @Prop(String) public error!: string | null
  @Prop(Boolean) public loading!: boolean | null
  @Prop(Boolean) public scrollToNextEpisode!: boolean | null
  @Prop(Boolean) public small!: boolean | null
  @Prop(Boolean) public padRight!: boolean | null

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
    this._scrollToNextEpisode()
  }

  public handleScroll(e: WheelEvent) {
    this.$refs.container.scrollBy(e.deltaY + e.deltaX, 0)
  }

  @Watch('episodes')
  public _scrollToNextEpisode() {
    if (
      !this.scrollToNextEpisode ||
      isNil(this.listEntry) ||
      isNil(this.episodes) ||
      this.episodes.length < 1
    ) {
      return
    }

    setTimeout(() => {
      const containerWidth = this.$refs.container.offsetWidth
      const episodeWidth = (this.$refs.episodes[0].$el as HTMLDivElement)
        .offsetWidth
      let offset = 0

      if (this.$refs.episodes.length > this.listEntry!.progress! || 0) {
        const nextEpisode = this.$refs.episodes[this.listEntry!.progress || 0]

        offset = (nextEpisode.$el as HTMLDivElement).offsetLeft
      } else {
        offset = this.$refs.container.clientWidth * 2
      }

      this.$refs.container.scrollTo({
        left: offset - (containerWidth / 2 - episodeWidth / 2),
        behavior: 'smooth',
      })
    }, 150)
  }
}
</script>

<style scoped lang="scss">
.episode-list {
  position: absolute;
  left: 0;
  right: 0;

  overflow: hidden;
  transition: opacity 0.25s;

  & > .episode-wrapper {
    display: inline-flex;
    align-items: center;
    padding: 15px;

    &.pad-right {
      padding-right: 320px;
    }
  }

  &.v-enter,
  &.v-leave-to {
    opacity: 0;
  }
}
</style>
