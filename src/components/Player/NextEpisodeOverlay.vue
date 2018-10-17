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

      <span/>

      <icon :icon="playSvg" />
    </div>
  </div>
</transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mdiPlay } from '@mdi/js'

import { Episode } from '@/types'
import { prop } from '@/utils'

import Icon from '../Icon.vue'
import { setCurrentEpisode } from '@/state/app'

@Component({
  components: { Icon },
})
export default class NextEpisodeOverlay extends Vue {
  @Prop(prop(Object, true))
  public nextEpisode!: Episode
  @Prop(prop(Number, true))
  public episodesInAnime!: number
  @Prop(prop(Boolean, true))
  public isPlayerMaximized!: boolean

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

  public setToNextEpisode() {
    setCurrentEpisode(this.$store, this.nextEpisode.index - 1)
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

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
    border-radius: 5px;
    overflow: hidden;
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
      fill: $white;
      filter: drop-shadow(0 0 4px black);
    }

    & > .thumbnail {
      display: block;
      width: 100%;
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
