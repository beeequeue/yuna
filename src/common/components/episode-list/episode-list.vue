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
      :items="episodes.map((e) => e.episodeNumber)"
      :progress="listEntry && listEntry.progress"
      :item-size="itemSize"
      :scroll-to-episode="scrollToEpisode"
    />

    <recycle-scroller
      v-slot="{ item }"
      ref="container"
      direction="horizontal"
      :items="episodes"
      :item-size="itemSize"
      :buffer="500"
      class="episode-wrapper"
      :class="episodeWrapperClasses"
      @wheel.prevent.native="handleScroll"
    >
      <episode
        :key="`${item.episodeNumber}:${item.id}`"
        :episode="item"
        :list-entry="listEntry"
        :small="small"
        @click="playEpisode(item.index)"
        @update-progress="updateProgress"
      />
    </recycle-scroller>
  </div>
  <source-list v-else :links="anime.externalLinks" />
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from "vue-property-decorator"
import { RecycleScroller } from "vue-virtual-scroller"
import {
  EpisodeListEpisodes,
  Provider,
  QueueAnime,
} from "@/graphql/generated/types"

import { Required } from "@/decorators"
import { setProgress } from "@/graphql/mutations/list-entry"
import { Hidive, HidiveResponseCode } from "@/lib/hidive"
import { PlayerState, PlayerSymbol } from "@/state/player"
import { delay, isNil } from "@/utils"

import Loading from "../loading.vue"
import SourceList from "../source-list.vue"
import ScrollBar from "./scroll-bar.vue"
import Episode from "./episode.vue"

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

  @Inject(PlayerSymbol as symbol)
  private player!: PlayerState

  public notAvailable = false

  public $refs!: {
    container: Vue
  }

  public get listEntry() {
    return this.anime?.listEntry ?? null
  }

  public get progress() {
    return this.listEntry?.progress ?? null
  }

  public get itemSize() {
    return !this.small ? 320 : 225
  }

  public mounted() {
    this.handleOpeningList()
  }

  public handleScroll(e: WheelEvent) {
    this.$refs.container.$el.scrollBy(e.deltaY + e.deltaX, 0)
  }

  public get episodeWrapperClasses() {
    return {
      "pad-right": this.padRight,
      padding: !this.noVerticalPadding,
      small: this.small,
    }
  }

  @Watch("episodes")
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
            this.$refs.container!.$el.scrollTo({ left: 0, behavior: "smooth" })
          }, 500)
          return
        }

        throw new Error(err)
      }
    }
  }

  public playEpisode(index: number) {
    if (this.episodes == null) return

    this.player.playlist = this.episodes.map(
      ({ animeId, provider, index }) => ({ animeId, provider, index }),
    )
    this.player.currentIndex = index
  }

  public updateProgress(episodeNumber: number) {
    if (!this.episodes || !this.listEntry) return

    setProgress(this, {
      animeId: this.anime.id,
      episodeNumber: episodeNumber,
      provider: this.episodes[0].provider,
    })
  }

  public scrollToEpisode(index: number) {
    if (isNil(this.episodes) || this.episodes.length < 1) {
      return
    }

    const { container } = this.$refs
    const innerWidth = container.$el.clientWidth
    const baseOffset = (index / this.episodes.length) * innerWidth
    const extraOffset = (index / this.episodes.length) * this.itemSize

    container.$el.scrollTo({
      left: index * this.itemSize - baseOffset + extraOffset,
      behavior: "smooth",
    })
  }

  @Watch("open")
  public async handleOpeningList() {
    // Have to wait for opening animation to finished before the component inside is rendered
    await delay(255)

    if (
      !this.scrollToNextEpisode ||
      !this.open ||
      isNil(this.episodes) ||
      this.episodes.length < 1 ||
      isNil(this.listEntry)
    ) {
      return
    }

    this.scrollToEpisode(
      this.episodes[this.listEntry.progress ?? 0]?.index ?? 0,
    )
  }
}
</script>

<style scoped lang="scss">
@import "../../../colors";

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
    font-family: "Raleway", sans-serif;
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
