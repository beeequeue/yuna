<template>
<div class="episodes" :data-episodes="episodes ? episodes.length : -1">
  <div v-if="loading" class="loading">
    <loader/>
    Looking for episodes...
  </div>

  <div
    v-if="episodes && episodes.length > 0 && !loading"
    ref="episodeContainer"
    class="episode-container"
    :class="containerClasses"
    @wheel.prevent="handleScroll"
    @scroll="updateContainerClasses"
  >
    <div
      v-for="(episode, i) in episodes"
      class="episode"
      :class="getEpisodeClasses(episode.episodeNumber)"
      :key="episode.crunchyroll.id"
    >
      <img
        class="thumbnail"
        :src="episode.thumbnail"
        @click="setCurrentEpisode(i)"
      />

      <div class="title-container">
        <div class="episode-number">Episode {{episode.episodeNumber}}</div>
        <div class="title">{{episode.title}}</div>
      </div>

      <transition name="fade">
        <c-button
          v-if="!getIsEpisodeWatched(episode.episodeNumber)"
          :icon="bookmarkSvg"
          @click.native.prevent="setProgress(episode.episodeNumber)"
        />
        <c-button
          v-else
          type="danger"
          :icon="unbookmarkSvg"
          @click.native.prevent="setProgress(episode.episodeNumber - 1)"
        />
      </transition>

      <transition>
        <icon
          v-if="getIsEpisodeWatched(episode.episodeNumber)"
          :icon="checkSvg"
          class="check"
        />
      </transition>
    </div>

    <div class="episode space-filler" :class="getEpisodeClasses(-1)" />
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
import { mdiCheckCircleOutline, mdiBookmark, mdiBookmarkRemove } from '@mdi/js'

import { setProgressMutation } from '@/graphql/mutations'
import { getSpoilerSettings, SettingsState } from '@/state/settings'
import {
  getPlaylistAnimeId,
  setPlaylist,
  setCurrentEpisode,
  ListEntry,
  Sequel,
  sendErrorToast,
} from '@/state/app'
import { AnimePageQuery_anime_nextAiringEpisode } from '@/graphql/AnimePageQuery'
import { AnimeCache } from '@/lib/cache'
import { Episode } from '@/types'
import { prop } from '@/utils'

import CButton from './CButton.vue'
import Icon from './Icon.vue'
import Loader from './Loader.vue'

@Component({ components: { CButton, Icon, Loader } })
export default class Episodes extends Vue {
  @Prop(prop(Number, true))
  public id!: number
  @Prop(prop(Number, true))
  public idMal!: number
  @Prop(prop(String, true))
  public animeName!: string
  @Prop(Number) public episodesInAnime!: number | null
  @Prop(Object)
  public nextAiringEpisode!: AnimePageQuery_anime_nextAiringEpisode | null
  @Prop(prop(Object))
  public listEntry?: ListEntry | null
  @Prop(prop(Array, true))
  public sequels!: Sequel[]
  @Prop(Boolean) public showScroller!: boolean | null
  @Prop(Boolean) public small!: boolean | null
  @Prop(Boolean) public rightPadding!: boolean | null
  @Prop(Boolean) public scrollToCurrentEpisode!: boolean | null

  public episodes: Episode[] | null = null
  public fetched = false
  public loading = true
  public error: string | null = null
  public scrollerValue = ''

  public bookmarkSvg = mdiBookmark
  public unbookmarkSvg = mdiBookmarkRemove
  public checkSvg = mdiCheckCircleOutline

  public containerClasses = {
    'furthest-left': true,
    'furthest-right': false,
  }

  public $refs!: {
    episodeContainer: HTMLDivElement
  }

  public get current() {
    return this.listEntry != null ? this.listEntry.progress + 1 : null
  }

  public mounted() {
    this.fetchEpisodes()
  }

  public updateContainerClasses() {
    const el = this.$refs.episodeContainer

    const width = el.scrollWidth

    this.containerClasses = {
      'furthest-left': el.scrollLeft <= 50,
      'furthest-right': el.scrollLeft + el.clientWidth >= width - 50,
    }
  }

  public handleScroll(e: MouseWheelEvent) {
    this.$refs.episodeContainer.scrollBy(e.deltaY, 0)
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
    const episodeIdx = (e.currentTarget as HTMLInputElement).value.trim()

    this.scrollerValue = episodeIdx

    if (episodeIdx === '') return

    this.$refs.episodeContainer.scroll({
      left: this.getScrollPositionOfEpisode(Number(episodeIdx)),
      behavior: 'smooth',
    })
  }

  public async fetchEpisodes() {
    if (this.fetched || !this.idMal) return

    try {
      this.fetched = true

      this.episodes = await AnimeCache.getSeasonFromMalId(this)

      this.loading = false

      setTimeout(() => this._scrollToCurrentEpisode(true), 150)
    } catch (e) {
      sendErrorToast(
        this.$store,
        `Could not fetch any episodes for ${this.animeName} - (${e.status})`,
      )

      this.error = e
      this.loading = false
    }
  }

  @Watch('current')
  public _scrollToCurrentEpisode(instant?: boolean | number) {
    if (this.scrollToCurrentEpisode && this.current) {
      this.$refs.episodeContainer.scroll({
        left: this.getScrollPositionOfEpisode(this.current),
        behavior: instant === true ? undefined : 'smooth',
      })
    }
  }

  public setCurrentEpisode(index: number) {
    if (!this.episodes) return

    const currentPlaylist = getPlaylistAnimeId(this.$store)

    if (currentPlaylist === this.id) {
      setCurrentEpisode(this.$store, index)
    } else {
      setPlaylist(this.$store, {
        anime: {
          id: this.id,
          title: this.animeName,
          episodes: this.episodesInAnime,
          sequels: this.sequels,
          nextAiringEpisode: this.nextAiringEpisode,
        },
        listEntry: this.listEntry,
        episodes: this.episodes,
        current: index,
      })
    }
  }

  public getIsEpisodeWatched(index: number) {
    return this.listEntry != null && this.listEntry.progress >= index
  }

  public getShouldBlur(
    epNumber: number,
  ): Required<SettingsState['spoilers']['episode']> {
    const settings = getSpoilerSettings(this.$store).episode
    const shouldBlur =
      this.listEntry == null ||
      (this.current != null && epNumber >= this.current)

    return {
      name: settings.name && shouldBlur,
      thumbnail: settings.thumbnail && shouldBlur,
    }
  }

  public getEpisodeClasses(index: number) {
    return {
      watched: this.getIsEpisodeWatched(index),
      current: this.listEntry && this.listEntry.progress + 1 === index,
      active: !this.small && Number(this.scrollerValue) === index,
      small: this.small,
      'right-padding': this.rightPadding,
      'blur-title': this.getShouldBlur(index).name,
      'blur-thumbnail': this.getShouldBlur(index).thumbnail,
    }
  }

  public setProgress(progress: number) {
    if (!this.listEntry) return

    setProgressMutation(this, this.listEntry.id, progress, this.listEntry)
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
    text-shadow: $outline;
    filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5));
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

    .episode {
      position: relative;
      flex-shrink: 0;
      height: 175px;
      margin: 0 10px;
      border-radius: 8px;
      box-shadow: 1px 0 5px rgba(0, 0, 0, 0.5);
      box-sizing: border-box;
      overflow: hidden;

      will-change: height;
      transition: height 0.25s;

      &:first-child {
        margin-left: 0;
      }

      &:hover > .button {
        bottom: 0;
      }

      &.small {
        height: 125px;
        font-size: 0.85em;
      }

      &.active {
        height: 200px;
      }

      &.blur {
        &-thumbnail > .thumbnail {
          filter: blur(15px);
        }
        &-title > .title-container > .title {
          opacity: 0;
          transform: translateX(10%);
        }
      }

      &.right-padding.space-filler {
        width: 300px;

        &.small {
          width: 200px;
        }
      }

      & > * {
        pointer-events: none;
      }

      & > .button {
        position: absolute;
        left: 0;
        bottom: -30px;
        border-top-left-radius: 0;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 0;
        transition: bottom 0.15s;
        pointer-events: all;
      }

      & > .check {
        display: block;
        position: absolute;
        bottom: -30px;
        right: -35px;
        height: 25px;
        width: 100px;
        fill: $white;
        background: $success;
        transform-origin: 0% 0%;
        transform: rotateZ(-45deg);

        &.v-enter-active,
        &.v-leave-active {
          transition: transform 0.5s;
        }

        &.v-enter,
        &.v-leave-to {
          transform: rotateZ(-45deg) translateX(100%);
        }

        &.v-enter-to,
        &.v-leave {
          transform: rotateZ(-45deg) translateX(0);
        }

        & /deep/ svg {
          transform: rotateZ(45deg);
        }
      }

      & > .title-container {
        position: absolute;
        top: 10px;
        left: 10px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        width: calc(100% - 20px);
        overflow: hidden;

        & > div {
          width: 100%;
          text-align: left;
          font-family: 'Raleway', sans-serif;
          font-weight: 600;
          font-size: 1.1em;
          text-shadow: $outline;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          transition: opacity 0.75s, transform 0.75s;
        }
      }

      & > .thumbnail {
        display: block;
        height: 100%;
        border-radius: 5px;
        cursor: pointer;
        pointer-events: all;
        transition: filter 0.75s;
      }
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
