<template>
<transition>
  <div class="next-episode-container">
    <transition>
      <div
        v-if="isPlayerMaximized"
        class="text"
      >
        <div>Up next...</div>
        <div>{{indexString}}/{{episodesInAnime}}</div>
        <div>{{title}}</div>
      </div>
    </transition>

    <div class="episode" @click="setToNextEpisode">
      <img
        :src="nextEpisode.thumbnail"
        class="thumbnail"
      />

      <icon :icon="playSvg" />

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

@Component({
  components: { CButton, Icon },
})
export default class NextEpisodeOverlay extends Vue {
  @Prop(prop(Object, true))
  public nextEpisode!: Episode
  @Prop(prop(Number, true))
  public episodesInAnime!: number
  @Prop(prop(Boolean, true))
  public isPlayerMaximized!: boolean
  @Prop(Boolean) public shouldAutoPlay?: boolean

  public timeoutId: number | null = null

  public get indexString() {
    return this.nextEpisode.title.substr(
      0,
      this.nextEpisode.title.indexOf(' - '),
    )
  }

  public get title() {
    return this.nextEpisode.title.substr(
      this.nextEpisode.title.indexOf(' - ') + 3,
    )
  }

  public playSvg = mdiPlay

  public mounted() {
    if (this.shouldAutoPlay) {
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
    setCurrentEpisode(this.$store, this.nextEpisode.index - 1)
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

  & > .text {
    font-size: 1.25em;
    padding: 5px;
    height: 75px;
    overflow: hidden;

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
      border-radius: 5px;
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
