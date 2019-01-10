<template>
  <div class="episode" :class="classes">
    <img
      v-if="!empty"
      class="thumbnail"
      :class="{ blur: blur.thumbnail }"
      :src="episode.thumbnail"
      @click="handleThumbnailClick(episode.episodeNumber)"
    />

    <div v-if="!empty" class="title-container">
      <div class="episode-number">Episode {{ episode.episodeNumber }}</div>
      <div class="title" :class="{ blur: blur.title }">{{ episode.title }}</div>
    </div>

    <transition v-if="!empty && listEntry != null" name="fade">
      <c-button
        v-if="!episode.isWatched"
        :icon="bookmarkSvg"
        @click.native.prevent="setProgress"
      />
      <c-button
        v-else
        type="danger"
        :icon="unbookmarkSvg"
        @click.native.prevent="setProgress"
      />
    </transition>

    <transition v-if="!empty">
      <icon v-if="episode.isWatched" :icon="checkSvg" class="check" />
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mdiBookmark, mdiBookmarkRemove, mdiCheckCircleOutline } from '@mdi/js'

import { setEpisodeUnwatched, setEpisodeWatched } from '@/graphql/mutations'
import { EpisodeListEpisodes } from '@/graphql/types'

import { Required } from '@/decorators'
import { ListEntry } from '@/state/app'
import { getSpoilerSettings } from '@/state/settings'

import CButton from './CButton.vue'
import Icon from './Icon.vue'

@Component({ components: { CButton, Icon } })
export default class Episode extends Vue {
  @Prop(Object) public listEntry!: ListEntry | null
  @Required(Function) public setCurrentEpisode!: (n: number) => void
  @Required(Object) public episode!: EpisodeListEpisodes
  @Prop(String) public scrollerValue!: string | null
  @Prop(Boolean) public small!: boolean | null
  @Prop(Boolean) public empty!: boolean | null

  public bookmarkSvg = mdiBookmark
  public unbookmarkSvg = mdiBookmarkRemove
  public checkSvg = mdiCheckCircleOutline

  public get isCurrent() {
    return (
      this.listEntry &&
      this.listEntry.progress + 1 === this.episode.episodeNumber
    )
  }

  public get classes() {
    if (this.empty === true) {
      return {
        empty: true,
        small: this.small,
      }
    }

    return {
      watched: this.episode.isWatched,
      current: this.isCurrent,
      active:
        !this.small &&
        Number(this.scrollerValue) === this.episode.episodeNumber,
      small: this.small,
    }
  }

  public get blur() {
    const settings = getSpoilerSettings(this.$store).episode

    return {
      title: settings.name && !this.episode.isWatched,
      thumbnail: settings.thumbnail && !this.episode.isWatched,
    }
  }

  public handleThumbnailClick(episodeNumber: number) {
    this.setCurrentEpisode(episodeNumber)
  }

  public setProgress() {
    if (!this.listEntry) return

    if (!this.episode.isWatched) {
      setEpisodeWatched(this, this.episode, this.listEntry as any)
    } else {
      setEpisodeUnwatched(this, this.episode, this.listEntry as any)
    }
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.episode {
  position: relative;
  flex-shrink: 0;
  height: 175px;
  margin: 0 10px;
  border-radius: 8px;
  box-shadow: 1px 2px 5px rgba(0, 0, 0, 0.5);
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

  &.empty {
    width: 300px;
    box-shadow: none;

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

    & > .title.blur {
      opacity: 0;
      transform: translateX(10%);
    }
  }

  & > .thumbnail {
    display: block;
    height: 100%;
    border-radius: 5px;
    cursor: pointer;
    pointer-events: all;
    transition: filter 0.75s;

    &.blur {
      filter: blur(15px);
    }
  }
}
</style>
