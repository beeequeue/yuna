<template>
  <transition>
    <div v-if="nextEpisode" class="next-episode-container">
      <transition>
        <div
          v-if="isPlayerMaximized"
          class="text"
          :class="{ 'hide-title': shouldHide.title }"
        >
          <div>Up next...</div>

          <div>
            Episode {{ nextEpisode.episodeNumber }}/{{ episodesInAnime || '?' }}
          </div>

          <div v-if="!shouldHide.title" class="episode-title">
            {{ nextEpisode.title }}
          </div>
        </div>
      </transition>

      <div class="episode" @click="setToNextEpisode">
        <img
          :src="nextEpisode.thumbnail"
          class="thumbnail"
          :class="{ blur: shouldHide.thumbnail }"
        />

        <icon :icon="playSvg" />
      </div>

      <transition>
        <div
          v-if="isPlayerMaximized && shouldAutoPlay && intervalId"
          class="timer-container"
        >
          <span>Starting in {{ secondsLeft }}...</span>

          <c-button
            flat
            type="white"
            content="Cancel"
            @click.native="cancelCountdown"
          />
        </div>
      </transition>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mdiPlay } from '@mdi/js'

import { EpisodeListEpisodes } from '@/graphql/types'

import { Required } from '@/decorators'
import { setCurrentEpisode } from '@/state/app'
import { getSpoilerSettings } from '@/state/settings'

import CButton from '../CButton.vue'
import Icon from '../Icon.vue'

@Component({
  components: { CButton, Icon },
})
export default class NextEpisodeOverlay extends Vue {
  @Prop(Object) public nextEpisode!: EpisodeListEpisodes | null
  @Prop(Number) public episodesInAnime!: number | null
  @Prop(Number) public progress!: number | null
  @Required(Boolean) public isPlayerMaximized!: boolean
  @Prop(Boolean) public shouldAutoPlay?: boolean

  public secondsLeft = 5
  public intervalId: number | null = null

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
      this.intervalId = window.setInterval(() => {
        if (this.secondsLeft > 1) {
          return this.secondsLeft--
        }

        window.clearInterval(this.intervalId as number)
        this.intervalId = null

        this.setToNextEpisode()
      }, 1000)
    }
  }

  public beforeDestroy() {
    this.cancelCountdown()
  }

  public cancelCountdown() {
    if (!this.intervalId) return

    window.clearInterval(this.intervalId)
    this.intervalId = null
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
  top: 80px;
  left: 0;
  bottom: 65px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  pointer-events: all;
  user-select: none;
  white-space: nowrap;
  font-family: 'Raleway', sans-serif;
  text-shadow: $outline;
  font-size: 1.25em;
  font-weight: 600;
  margin: 0;
  filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.35));
  z-index: 100;

  & > .text {
    padding: 5px;
    height: 75px;
    overflow: hidden;

    &.hide-title {
      height: 55px;
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
    z-index: 2;

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
  }

  & > .timer-container {
    position: relative;
    height: 43px;
    width: 35%;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    z-index: 1;

    & > span,
    .button {
      padding: 0;
      padding-top: 5px;
    }

    & > .button {
      padding-left: 15px;
      padding-bottom: 15px;
      pointer-events: all;
      text-shadow: $outline !important;
      overflow: hidden;

      & /deep/ .content {
        padding: 0;
      }
    }

    &.v-enter-active {
      transition: height 0.5s;
    }

    &.v-leave-active {
      transition: height 0.15s;
    }

    &.v-enter,
    &.v-leave-to {
      height: 0;
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
