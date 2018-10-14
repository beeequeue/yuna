<template>
<div class="episodes">
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
      :class="{ active: i === Number(scrollerValue) - 1, small }"
      @click="setCurrentEpisode(i)"
      :key="episode.crunchyroll.id"
    >
      <span class="title" v-html="episode.title.replace(' - ', '<br/>')"/>

      <img class="thumbnail" :src="episode.thumbnail"/>
    </div>
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

import Loader from './Loader.vue'
import { AnimeCache } from '../lib/cache'
import { Episode } from '../types'
import { prop } from '../utils'
import {
  getPlaylistAnimeId,
  setPlaylist,
  setCurrentEpisode,
  ListEntry,
} from '../state/app'

@Component({
  components: { Loader },
})
export default class Episodes extends Vue {
  @Prop(prop(Number, true))
  public id!: number
  @Prop(prop(Number, true))
  public idMal!: number
  @Prop(prop(Object))
  public listEntry?: ListEntry | null
  @Prop(Number) public current?: number
  @Prop(Boolean) public showScroller?: boolean
  @Prop(Boolean) public small?: boolean

  public episodes: Episode[] | null = null
  public fetched = false
  public loading = true
  public error: string | null = null
  public scrollerValue = ''

  public containerClasses = {
    'furthest-left': true,
    'furthest-right': false,
  }

  public $refs!: {
    episodeContainer: HTMLDivElement
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

      this.episodes = await AnimeCache.getSeasonFromMalId(this.idMal)

      this.loading = false

      setTimeout(this.scrollToCurrentEpisode, 150)
    } catch (e) {
      console.error(e)
      this.error = e
      this.loading = false
    }
  }

  @Watch('current')
  public scrollToCurrentEpisode() {
    if (this.current) {
      this.$refs.episodeContainer.scroll({
        left: this.getScrollPositionOfEpisode(this.current),
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
        id: this.id,
        listEntry: this.listEntry,
        episodes: this.episodes,
        current: index,
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
    text-shadow: $outline;
    filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5));
  }

  & > .episode-container {
    display: flex;
    width: 100%;
    overflow: scroll;

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
      width: 300px;
      margin: 0 10px;
      border-radius: 8px;
      box-shadow: 1px 0 5px rgba(0, 0, 0, 0.5);
      cursor: pointer;
      box-sizing: border-box;
      overflow: hidden;

      will-change: width;
      transition: width 0.25s;
      transition-delay: 0.25s;

      &.small {
        width: 200px;
        font-size: 0.85em;
      }

      &.active {
        width: 325px;
        transition-delay: 0s;
      }

      &:first-child {
        margin-left: 0;
      }

      & > .title {
        position: absolute;
        top: 10px;
        left: 10px;
        width: calc(100% - 20px);
        text-align: left;
        font-family: 'Raleway', sans-serif;
        font-weight: 600;
        font-size: 1.1em;
        text-shadow: $outline;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      & > .thumbnail {
        display: block;
        width: 100%;
        border-radius: 5px;
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
