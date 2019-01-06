<template>
  <div class="episodes" :data-episodes="episodes ? episodes.length : -1">
    <div v-if="loading" class="loading"><loader />Looking for episodes...</div>

    <div v-if="error" class="error">
      <c-button :icon="reloadSvg" type="danger" :click="refetchEpisodes" />
      {{ error }}
    </div>

    <div
      v-if="!loading && !error && episodes && episodes.length > 0"
      ref="episodeContainer"
      class="episode-container"
      :class="containerClasses"
      @wheel.prevent="handleScroll"
      @scroll="updateContainerClasses"
    >
      <episode
        v-for="episode in episodes"
        :key="episode.name"
        :episode="episode"
        :listEntry="listEntry"
        :small="small"
        :setCurrentEpisode="setCurrentEpisode"
      />

      <episode
        v-if="rightPadding"
        key="empty"
        :episode="{ episodeNumber: -1 }"
        :small="small"
        :setCurrentEpisode="() => {}"
        :empty="true"
      />
    </div>

    <input
      v-if="showScroller && episodes && episodes.length > 0 && !loading"
      class="scroller"
      :maxlength="episodes.length.toString().length"
      :value="scrollerValue"
      placeholder="1"
      @keydown.capture="handleScrollerKeydown"
      @input="handleScrollerChange"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Key } from 'ts-key-enum'
import { mdiCached } from '@mdi/js'

import { AnimeCache } from '@/lib/cache'
import {
  getPlaylistAnimeId,
  ListEntry,
  sendErrorToast,
  Sequel,
  setCurrentEpisode,
  setPlaylist,
} from '@/state/app'
import { AnimePageQueryNextAiringEpisode } from '@/graphql/types'
import { Episode as IEpisode } from '@/types'
import { prop } from '@/utils'

import CButton from './CButton.vue'
import Episode from './Episode.vue'
import Icon from './Icon.vue'
import Loader from './Loader.vue'

@Component({ components: { CButton, Episode, Icon, Loader } })
export default class EpisodeList extends Vue {
  @Prop(prop(Number, true))
  public id!: number
  @Prop(prop(Number, true))
  public idMal!: number
  @Prop(prop(String, true))
  public animeName!: string
  @Prop(Number) public episodesInAnime!: number | null
  @Prop(Object)
  public nextAiringEpisode!: AnimePageQueryNextAiringEpisode | null
  @Prop(prop(Object))
  public listEntry?: ListEntry | null
  @Prop(prop(Array, true))
  public sequels!: Sequel[]
  @Prop(Boolean) public showScroller!: boolean | null
  @Prop(Boolean) public small!: boolean | null
  @Prop(Boolean) public rightPadding!: boolean | null
  @Prop(Boolean) public scrollToCurrentEpisode!: boolean | null

  public episodes: IEpisode[] | null = null
  public fetched = false
  public loading = true
  public error: string | null = null
  public scrollerValue = ''

  public reloadSvg = mdiCached

  public containerClasses = {
    'furthest-left': true,
    'furthest-right': false,
  }

  public $refs!: {
    episodeContainer: HTMLDivElement
  }

  public get currentEpisode() {
    return this.listEntry != null ? this.listEntry.progress + 1 : null
  }

  public mounted() {
    this.fetchEpisodes()
  }

  public updateContainerClasses() {
    const el = this.$refs.episodeContainer

    if (!el)
      return {
        'furthest-left': true,
        'furthest-right': false,
      }

    const width = el.scrollWidth

    this.containerClasses = {
      'furthest-left': el.scrollLeft <= 50,
      'furthest-right': el.scrollLeft + el.clientWidth >= width - 50,
    }
  }

  public handleScroll(e: WheelEvent) {
    this.$refs.episodeContainer.scrollBy(e.deltaY + e.deltaX, 0)
  }

  private allowedKeys = [
    Key.Backspace,
    Key.Delete,
    Key.ArrowLeft,
    Key.ArrowRight,
    Key.Home,
    Key.End,
  ]
  public handleScrollerKeydown(e: KeyboardEvent) {
    if (!/\d/.test(e.key) && !this.allowedKeys.includes(e.key as Key)) {
      e.preventDefault() // If key is not a number
    }
  }

  private getScrollPositionOfEpisode(index: number) {
    const container = this.$refs.episodeContainer
    const episode = container.querySelector(
      `.episode:nth-child(${index})`,
    ) as HTMLElement | null

    if (!episode) return 0

    return (
      episode.offsetLeft - container.clientWidth / 2 + episode.clientWidth / 2
    )
  }

  public handleScrollerChange(e: KeyboardEvent) {
    const episodeContainer = this.$refs.episodeContainer

    if (!episodeContainer) return

    const episodeIdx = (e.currentTarget as HTMLInputElement).value.trim()

    this.scrollerValue = episodeIdx

    if (!episodeContainer || episodeIdx === '') return

    episodeContainer.scroll({
      left: this.getScrollPositionOfEpisode(Number(episodeIdx)),
      behavior: 'smooth',
    })
  }

  public refetchEpisodes() {
    this.fetched = false
    this.error = null
    this.fetchEpisodes()
  }

  public async fetchEpisodes() {
    if (this.fetched || !this.idMal) return

    this.loading = true

    try {
      this.fetched = true

      this.episodes = await AnimeCache.getSeasonFromMalId(this)

      this.loading = false

      setTimeout(() => this._scrollToCurrentEpisode(true), 150)
    } catch (e) {
      sendErrorToast(
        this.$store,
        `Could not fetch any episodes for ${this.animeName} - (${e.message})`,
      )

      this.error = e.message
      this.loading = false
    }
  }

  @Watch('current')
  public _scrollToCurrentEpisode(instant?: boolean | number) {
    const episodeContainer = this.$refs.episodeContainer

    if (
      episodeContainer &&
      this.scrollToCurrentEpisode &&
      this.currentEpisode
    ) {
      episodeContainer.scroll({
        left: this.getScrollPositionOfEpisode(this.currentEpisode),
        behavior: instant === true ? undefined : 'smooth',
      })
    }
  }

  public setCurrentEpisode(episodeNumber: number) {
    if (!this.episodes) return

    const currentPlaylist = getPlaylistAnimeId(this.$store)

    if (currentPlaylist === this.id) {
      setCurrentEpisode(this.$store, episodeNumber - 1)
    } else {
      setPlaylist(this.$store, {
        id: this.id,
        idMal: this.idMal,
        index: episodeNumber - 1,
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.episodes {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  z-index: -1;

  & > .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto;
    text-shadow: $outline;
    filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5));
  }

  & > .error {
    margin: auto;
    color: $danger;
    font-size: 1.05em;
    font-weight: 600;
    display: flex;
    align-items: center;

    & > .button {
      margin-right: 10px;
    }
  }

  & > .episode-container {
    display: flex;
    align-items: flex-start;
    width: 100%;
    overflow-x: auto;

    &:not(.furthest-left) {
      mask-image: linear-gradient(90deg, transparent, black 5%);
    }

    &:not(.furthest-right) {
      mask-image: linear-gradient(-90deg, transparent, black 5%);
    }

    &:not(.furthest-left):not(.furthest-right) {
      mask-image: linear-gradient(
        90deg,
        transparent,
        black 5%,
        black 95%,
        transparent
      );
    }

    &::-webkit-scrollbar {
      display: none;
    }
  }

  & > .scroller {
    position: relative;
    margin-top: 10px;
    background: none;
    border: none;
    padding-bottom: 5px;
    border-bottom: 2px solid white;
    width: 60px;
    color: $white;
    font-family: 'Raleway', sans-serif;
    font-size: 1.5em;
  }
}
</style>
