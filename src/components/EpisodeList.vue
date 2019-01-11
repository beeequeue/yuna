<template>
  <div class="episodes" :data-episodes="episodes ? episodes.length : -1">
    <div v-if="$apollo.loading" class="loading">
      <loader />Looking for episodes...
    </div>

    <div v-if="error" class="error">
      <c-button :icon="reloadSvg" type="danger" :click="refetchEpisodes" />
      {{ error }}
    </div>

    <div
      v-if="!$apollo.loading && !error && episodes && episodes.length > 0"
      ref="episodeContainer"
      class="episode-container"
      :class="containerClasses"
      @wheel.prevent="handleScroll"
      @scroll="updateContainerClasses"
    >
      <episode
        v-for="episode in episodes"
        :key="`${episode.name}:${episode.id}`"
        ref="episodes"
        :episode="episode"
        :listEntry="listEntry"
        :small="small"
        :setCurrentEpisode="setCurrentEpisode"
        :data-episode="episode.episodeNumber"
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
      v-if="showScroller && episodes && episodes.length > 0 && !$apollo.loading"
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
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Key } from 'ts-key-enum'
import { find, pathEq, pathOr } from 'rambdax'
import { mdiCached } from '@mdi/js'

import EPISODE_LIST from '@/graphql/EpisodeList.graphql'
import {
  AnimePageQueryNextAiringEpisode,
  EpisodeListEpisodes,
} from '@/graphql/types'

import { Query, Required } from '@/decorators'
import {
  getPlaylistAnimeId,
  ListEntry,
  setCurrentEpisode,
  setPlaylist,
} from '@/state/app'

import CButton from './CButton.vue'
import Episode from './Episode.vue'
import Icon from './Icon.vue'
import Loader from './Loader.vue'

@Component({ components: { CButton, Episode, Icon, Loader } })
export default class EpisodeList extends Vue {
  @Required(Number) public id!: number
  @Required(Number) public idMal!: number
  @Required(String) public animeTitle!: string
  @Prop(Number) public episodesInAnime!: number | null
  @Prop(Object)
  public nextAiringEpisode!: AnimePageQueryNextAiringEpisode | null
  @Prop(Object) public listEntry!: ListEntry | null
  @Prop(Boolean) public showScroller!: boolean | null
  @Prop(Boolean) public small!: boolean | null
  @Prop(Boolean) public rightPadding!: boolean | null
  @Prop(Boolean) public scrollToCurrentEpisode!: boolean | null

  @Query({
    fetchPolicy: 'network-only',
    query: EPISODE_LIST,
    variables() {
      return {
        id: this.id,
      }
    },
    skip() {
      return !this.id
    },
    result() {
      setTimeout(() => {
        this._scrollToEpisode()
      }, 200)
    },
    error(err) {
      if (typeof err === 'string') {
        this.error = err
        return
      }

      if (typeof err.message === 'string') {
        this.error = err.message
        return
      }

      this.error = 'Something went wrong fetching the episodes. :('
    },
  })
  public episodes: EpisodeListEpisodes[] | null = null
  public error: string | null = null
  public scrollerValue = ''

  public reloadSvg = mdiCached

  public containerClasses = {
    'furthest-left': true,
    'furthest-right': false,
  }

  public $refs!: {
    episodeContainer: HTMLDivElement
    episodes: Episode[]
  }

  public get currentEpisode() {
    return this.listEntry != null ? this.listEntry.progress + 1 : null
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

  public handleScrollerChange(e: KeyboardEvent) {
    const episodeIdx = (e.currentTarget as HTMLInputElement).value.trim()

    this.scrollerValue = episodeIdx

    if (episodeIdx === '') return

    const episodeEl = this.getEpisodeElement(Number(episodeIdx))

    if (!episodeEl) return

    this.$refs.episodeContainer.scroll({
      left: this.getContainerScrollLeft(episodeEl),
      behavior: 'smooth',
    })
  }

  public refetchEpisodes() {
    this.$apollo.queries.episodes.refetch()
    this.error = null
  }

  public _scrollToEpisode() {
    if (!this.currentEpisode) return

    const currentEpisodeDiv = this.getEpisodeElement(this.currentEpisode)

    if (this.scrollToCurrentEpisode && currentEpisodeDiv != null) {
      this.$refs.episodeContainer.scroll({
        left: this.getContainerScrollLeft(currentEpisodeDiv),
        behavior: 'smooth',
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
        index: episodeNumber - 1,
      })
    }
  }

  private getEpisodeElement(episodeNumber: number) {
    if (!this.$refs.episodes || this.$refs.episodes.length < 1) return null

    return pathOr(
      null,
      ['$el'],
      find(
        pathEq(['episode', 'episodeNumber'], episodeNumber),
        this.$refs.episodes,
      ),
    ) as HTMLDivElement | null
  }

  private getContainerScrollLeft(episodeElement: HTMLDivElement) {
    const containerDiv = this.$refs.episodeContainer

    if (!containerDiv) return 0

    return (
      episodeElement.offsetLeft -
      containerDiv.clientWidth / 2 +
      episodeElement.clientWidth / 2
    )
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
