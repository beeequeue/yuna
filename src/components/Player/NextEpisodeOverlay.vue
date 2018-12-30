<template>
  <transition>
    <div v-if="nextEpisode" class="next-episode-container">
      <transition>
        <div v-if="isPlayerMaximized" class="text" :class="{ 'hide-title': shouldHide.title }">
          <div>Up next...</div>

          <div>{{nextEpisode.episodeNumber}}/{{episodesInAnime || '?'}}</div>

          <div v-if="!shouldHide.title" class="episode-title">{{nextEpisode.title}}</div>
        </div>
      </transition>

      <div class="episode" @click="setToNextEpisode">
        <img :src="nextEpisode.thumbnail" class="thumbnail" :class="{ blur: shouldHide.thumbnail }">

        <icon :icon="playSvg"/>

        <span v-if="shouldAutoPlay && timeoutId" class="countdown-line"/>
      </div>

      <transition>
        <c-button
          v-if="isPlayerMaximized && shouldAutoPlay && timeoutId"
          flat
          type="white"
          content="Cancel"
          @click.native="cancelCountdown"
        />
      </transition>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mdiPlay } from '@mdi/js'

import { setCurrentEpisode } from '@/state/app'
import { Episode } from '@/types'
import { prop } from '@/utils'

import CButton from '../CButton.vue'
import Icon from '../Icon.vue'
import { getSpoilerSettings } from '@/state/settings'

@Component({
  components: { CButton, Icon },
})
export default class NextEpisodeOverlay extends Vue {
  @Prop(prop(Object))
  public nextEpisode!: Episode | null
  @Prop(Number) public episodesInAnime!: number | null
  @Prop(Number) public progress!: number | null
  @Prop(prop(Boolean, true))
  public isPlayerMaximized!: boolean
  @Prop(Boolean) public shouldAutoPlay?: boolean

  public timeoutId: number | null = null

  public playSvg = mdiPlay

  public get shouldHide() {
    if (this.nextEpisode == null || this.progress == null) return false

    const settings = getSpoilerSettings(this.$store).episode
    const shouldHide = this.nextEpisode.episodeNumber > this.progress

    return {
      title: settings.name && shouldHide,
      thumbnail: settings.thumbnail && shouldHide,
    }
  }

  public mounted() {
    if (this.nextEpisode && this.shouldAutoPlay) {
      this.timeoutId = window.setTimeout(() => {
        this.timeoutId = null

        this.setToNextEpisode()
      }, 5000)
    }
  }

  public beforeDestroy() {
    this.cancelCountdown()
  }

  public cancelCountdown() {
    if (!this.timeoutId) return

    window.clearTimeout(this.timeoutId)
    this.timeoutId = null
  }

  public setToNextEpisode() {
    if (!this.nextEpisode) return

    setCurrentEpisode(this.$store, this.nextEpisode.index)
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

@keyframes expand {
  from {
    right: 100%;
  }
  to {
    right: 0;
  }
}

.next-episode-container {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  user-select: none;

  & > .text {
    font-size: 1.25em;
    padding: 5px;
    height: 75px;
    overflow: hidden;

    &.hide-title {
      height: 55px;
    }

    & > * {
      white-space: nowrap;
      font-family: 'Raleway', sans-serif;
      text-shadow: $outline;
      font-weight: 600;
      margin: 0;
      filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.35));

      &:first-child {
        font-size: 0.9em;
      }
    }

    & > .episode-title {
      max-width: 850px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &.v-enter-active,
    &.v-leave-active {
      transition: 0.5s;
    }

    &.v-enter,
    &.v-leave-to {
      height: 0;
      padding: 0;
    }
  }

  & > .episode {
    position: relative;
    max-width: 35%;
    box-shadow: $shadow;
    cursor: pointer;
    pointer-events: all;
    border-radius: 5px;
    overflow: hidden;

    & > .icon {
      display: block;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      height: 50%;
      width: 50%;
      min-height: 50px;
      min-width: 50px;
      fill: $white;
      filter: drop-shadow(0 0 4px black);
    }

    & > .thumbnail {
      display: block;
      width: 100%;

      &.blur {
        filter: blur(12px);
      }
    }

    & > .countdown-line {
      position: absolute;
      left: 0;
      right: 100%;
      bottom: 0;
      height: 2px;
      background: $highlight;
      box-shadow: 0 -2px 2px $highlight;

      animation: expand 5s linear;
      animation-iteration-count: 1;
    }
  }

  & > .button {
    position: relative;
    pointer-events: all;
    text-shadow: $outline !important;
    padding: 0.35em 2em 0.5em;
    font-size: 1.25em;
    height: 45px;
    overflow: hidden;

    &.v-enter-active {
      transition: 0.5s;
    }

    &.v-leave-active {
      transition: 0.25s;
    }

    &.v-enter,
    &.v-leave-to {
      height: 0;
      padding: 0;
    }

    &.v-leave,
    &.v-enter-to {
      height: 45px;
      padding: 0.35em 2em 0.5em;
    }
  }

  &.v-enter-active,
  &.v-leave-active {
    transition: transform 0.75s;
  }

  &.v-enter {
    transform: translateX(100%);
  }

  &.v-leave-to {
    transform: translateX(-150%);
  }
}
</style>
