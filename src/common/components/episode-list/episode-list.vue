<template>
  <div v-if="loading" class="loading-wrapper">
    <loading :size="40" />
  </div>
  <div v-else-if="episodes && episodes.length > 0" class="episode-list">
    <transition name="fade">
      <div v-if="notAvailable" class="not-available-notice">
        This show is not available in your country. 😢
      </div>
    </transition>

    <scroll-bar
      v-if="!noVerticalPadding"
      :items="episodes.map(e => e.episodeNumber)"
      :progress="listEntry && listEntry.progress"
      :itemSize="itemSize"
    />

    <recycle-scroller
      direction="horizontal"
      :items="episodes"
      :itemSize="itemSize"
      :buffer="500"
      v-slot="{ item }"
      class="episode-wrapper"
      :class="episodeWrapperClasses"
      ref="container"
      @wheel.prevent.native="handleScroll"
    >
      <episode
        :key="`${item.episodeNumber}:${item.id}`"
        ref="episodes"
        :episode="item"
        :listEntry="listEntry"
        :small="small"
      />
    </recycle-scroller>
  </div>
  <source-list v-else :links="anime.externalLinks" />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { RecycleScroller } from 'vue-virtual-scroller'
import { oc } from 'ts-optchain'

import { EpisodeListEpisodes, Provider, QueueAnime } from '@/graphql/types'

import { Required } from '@/decorators'
import { Hidive, HidiveResponseCode } from '@/lib/hidive'
import { isNil } from '@/utils'

import Episode from './episode.vue'
import ScrollBar from './scroll-bar.vue'
import Loading from '../loading.vue'
import SourceList from '../source-list.vue'

@Component({
  components: { ScrollBar, RecycleScroller, SourceList, Loading, Episode },
})
export default class EpisodeList extends Vue {
  @Required(Object) public anime!: QueueAnime
  @Prop(Array) public episodes!: EpisodeListEpisodes[] | null
  @Prop(String) public error!: string | null
  @Prop(Boolean) public loading!: boolean
  @Prop(Boolean) public scrollToNextEpisode!: boolean
  @Prop(Boolean) public small!: boolean
  @Prop(Boolean) public padRight!: boolean
  @Prop(Boolean) public noVerticalPadding!: boolean
  @Prop(Boolean) public open!: boolean

  public notAvailable = false

  public $refs!: {
    container: Vue
    episodes: Episode[]
  }

  public get listEntry() {
    return oc(this.anime).listEntry(null)
  }

  public get progress() {
    return oc(this.listEntry).progress() || null
  }

  public get itemSize() {
    return !this.small ? 320 : 225
  }

  public mounted() {
    this._scrollToNextEpisode()
  }

  public handleScroll(e: WheelEvent) {
    this.$refs.container.$el.scrollBy(e.deltaY + e.deltaX, 0)
  }

  public get episodeWrapperClasses() {
    return {
      'pad-right': this.padRight,
      padding: !this.noVerticalPadding,
      small: this.small,
    }
  }

  @Watch('episodes')
  public async tryToFetchEpisode() {
    this.notAvailable = false

    if (isNil(this.episodes) || isNil(this.episodes[0])) {
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
            this.$refs.container!.$el.scrollTo({ left: 0, behavior: 'smooth' })
          }, 500)
          return
        }

        throw new Error(err)
      }
    }
  }

  @Watch('open')
  @Watch('progress')
  public _scrollToNextEpisode(iteration: number = 0): void {
    if (!oc(this.$refs).episodes[0]() && iteration < 50) {
      setTimeout(() => this._scrollToNextEpisode(iteration + 1), 50)

      return
    }

    if (
      !this.scrollToNextEpisode ||
      !this.open ||
      isNil(this.listEntry) ||
      isNil(this.episodes) ||
      isNil(this.$refs.episodes) ||
      isNil(this.$refs.episodes[0]) ||
      this.episodes.length < 1
    ) {
      return
    }

    const containerRect = this.$refs.container.$el.getBoundingClientRect()
    const episodeRect = this.$refs.episodes[0].$el.getBoundingClientRect()
    let offset

    if (this.$refs.episodes.length > this.listEntry!.progress! || 0) {
      const nextEpisode = this.$refs.episodes[this.listEntry!.progress || 0]

      offset = (nextEpisode.$el as HTMLDivElement).offsetLeft
    } else {
      offset = this.$refs.container.$el.clientWidth * 2
    }

    this.$refs.container.$el.scrollTo({
      left: offset - (containerRect.width / 2 - episodeRect.width / 2),
      behavior: 'smooth',
    })
  }
}
</script>

<style scoped lang="scss">
@import '../../../colors';

.loading-wrapper {
  padding: 10px;
}

.episode-list {
  position: absolute;
  display: flex;
  left: 0;
  right: 0;
  overflow-x: hidden;
  transition: opacity 0.25s;

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
    position: relative;
    display: inline-flex;
    align-items: center;
    box-sizing: content-box !important;
    height: 195px;
    overflow-x: scroll;

    &::-webkit-scrollbar {
      display: none;
    }

    &.padding {
      padding: 15px;
      padding-top: 25px;
    }

    &.pad-right {
      padding-right: 320px;
    }

    &.small {
      height: 125px;
    }
  }

  &.v-enter,
  &.v-leave-to {
    opacity: 0;
  }
}
</style>
