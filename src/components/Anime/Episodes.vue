<template>
<div class="episodes">
  <div
    ref="episodeContainer"
    class="episode-container"
    :class="containerClasses"
    @wheel.capture="handleScroll"
    @scroll="updateContainerClasses"
  >
    <div
      v-for="(episode, i) in _episodes"
      class="episode"
      :class="{ active: i === Number(scrollerValue) - 1 }"
      @click="setCurrentEpisode(crunchyrollIds[i])"
    >
      <span class="title" v-html="episode.title"/>

      <img class="thumbnail" :src="episode.thumbnail"/>
    </div>
  </div>

  <input
    class="scroller"
    :maxlength="_episodes.length.toString().length"
    :value="scrollerValue"
    placeholder="1"
    @keydown.capture="handleScrollerKeydown"
    @input="handleScrollerChange"
  />
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { path } from 'rambda'
import { Key } from 'ts-key-enum'

import { AnimePage_Media_streamingEpisodes as StreamingEpisodes } from '../../graphql/AnimePage'
import { setCurrentEpisode } from '../../state/app'
import { fetchEpisode } from '../../lib/crunchyroll'
import { prop } from '../../utils'

interface Episode {
  __typename: 'MediaStreamingEpisode'
  title: string
  site: string
  url: string
  thumbnail: string
}

@Component
export default class Episodes extends Vue {
  @Prop(prop(Array))
  public episodes!: StreamingEpisodes[]

  public scrollerValue = ''

  public containerClasses = {
    'furthest-left': true,
    'furthest-right': false,
  }

  public $refs!: {
    episodeContainer: HTMLDivElement
  }

  public get _episodes(): Episode[] {
    if (!this.episodes) return []

    return this.episodes
      .filter(e => e != null && e.site === 'Crunchyroll')
      .map((e: any) => ({
        ...(e as Episode),
        title: e.title.replace(' - ', '<br/>'),
      }))
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

  public handleScrollerChange(e: KeyboardEvent) {
    const container = this.$refs.episodeContainer
    const episodeIdx = (e.currentTarget as HTMLInputElement).value.trim()

    this.scrollerValue = episodeIdx

    if (episodeIdx === '') return

    const episode = container.querySelector(
      `.episode:nth-child(${episodeIdx})`,
    ) as HTMLElement | null

    if (episode) {
      this.$refs.episodeContainer.scroll({
        left:
          episode.offsetLeft -
          container.clientWidth / 2 +
          episode.clientWidth / 2,
        behavior: 'smooth',
      })
    }
  }

  public get crunchyrollIds() {
    return this._episodes.map(e => path<string>([1], e.url.match(/-(\d+)$/)))
  }

  public async setCurrentEpisode(id: string) {
    setCurrentEpisode(this.$store, await fetchEpisode(id))
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.episodes {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  z-index: -1;

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

    & > .episode {
      position: relative;
      flex-shrink: 0;
      width: 250px;
      margin: 0 10px;
      border-radius: 8px;
      box-shadow: 1px 0 5px rgba(0, 0, 0, 0.5);
      cursor: pointer;
      box-sizing: border-box;
      overflow: hidden;

      will-change: width;
      transition: width 0.25s;
      transition-delay: 0.25s;

      &.active {
        width: 275px;
        transition-delay: 0s;
      }

      &:first-child {
        margin-left: 0;
      }

      & > .title {
        position: absolute;
        top: 10px;
        left: 10px;
        width: calc(100% - 10px);
        text-align: left;
        font-family: 'Raleway', sans-serif;
        font-weight: 600;
        font-size: 1.1em;
        text-shadow: 1px 1px 1px black;
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
