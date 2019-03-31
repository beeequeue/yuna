<template>
  <div v-if="loading" class="loading-wrapper">
    <loading :size="40" />
  </div>
  <div
    v-else-if="episodes && episodes.length > 0"
    class="episode-list"
    ref="container"
    @wheel.prevent="handleScroll"
  >
    <transition name="fade">
      <div v-if="notAvailable" class="not-available-notice">
        This show is not available in your country. 😢
      </div>
    </transition>

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
import { oc } from 'ts-optchain'

import { EpisodeListEpisodes, Provider, QueueAnime } from '@/graphql/types'

import { Required } from '@/decorators'
import { Hidive, HidiveResponseCode } from '@/lib/hidive'
import { isNil } from '@/utils'

import Episode from './Episode.vue'
import Loading from './Loading.vue'
import SourceList from './SourceList.vue'

@Component({ components: { SourceList, Loading, Episode } })
export default class EpisodeList extends Vue {
  @Required(Object) public anime!: QueueAnime
  @Prop(Array) public episodes!: EpisodeListEpisodes[] | null
  @Prop(String) public error!: string | null
  @Prop(Boolean) public loading!: boolean | null
  @Prop(Boolean) public scrollToNextEpisode!: boolean | null
  @Prop(Boolean) public small!: boolean | null
  @Prop(Boolean) public padRight!: boolean | null

  public notAvailable = false

  public $refs!: {
    container: HTMLDivElement
    episodes: Episode[]
  }

  public get listEntry() {
    return oc(this.anime).mediaListEntry(null)
  }

  public mounted() {
    this._scrollToNextEpisode()
  }

  public handleScroll(e: WheelEvent) {
    this.$refs.container.scrollBy(e.deltaY + e.deltaX, 0)
  }

  @Watch('episodes')
  public async tryToFetchEpisode() {
    this.notAvailable = false

    if (!this.episodes || this.episodes.length < 1) {
      return
    }

    const episode = this.episodes[0]

    if (episode.provider === Provider.Hidive) {
      try {
        await Hidive.fetchStream(episode.id)
      } catch (err) {
        if (err.message === HidiveResponseCode.RegionRestricted) {
          this.notAvailable = true
          setTimeout(() => {
            this.$refs.container!.scrollTo({ left: 0, behavior: 'smooth' })
          }, 500)
          return
        }

        throw new Error(err)
      }
    }
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
@import '../colors';

.loading-wrapper {
  padding: 10px;
}

.episode-list {
  position: absolute;
  left: 0;
  right: 0;
  overflow-x: scroll;
  transition: opacity 0.25s;

  &::-webkit-scrollbar {
    display: none;
  }

  & > .not-available-notice {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
    padding: 10px;
    padding-right: 100px;
    background: linear-gradient(90deg, $danger, $danger, $danger, transparent);
    font-family: 'Raleway', sans-serif;
    font-weight: 500;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
    z-index: 10;
  }

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
