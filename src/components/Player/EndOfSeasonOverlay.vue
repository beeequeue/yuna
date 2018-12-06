<template>
<transition>
  <div class="end-of-season-container" :class="{ small: !isPlayerMaximized }">
    <h1 class="text">
      {{endMessage}}
    </h1>

    <h2
      v-if="!isFinalEpisode"
      class="text two-lines"
    >
      The next episode airs in {{nextEpisodeDistanceString}}
      <br/>
      {{nextEpisodeDateString}}
    </h2>

    <div v-if="isFinalEpisode" class="scores-container">
      <div
        v-for="(s, index) in scores"
        :key="index"
        class="score"
        @click="updateScore(s)"
      >
        <icon
          v-if="listEntry.score >= s"
          :icon="starSvg"
        />
        <icon
          v-else
          :icon="hollowStarSvg"
        />
      </div>
    </div>

    <div v-if="isFinalEpisode" class="sequel-container">
      <h1 class="text">Sequel{{sequels.length > 1 ? 's' : ''}}:</h1>

      <div
        v-for="sequel in sequels"
        :key="sequel.id"
        class="sequel"
      >
        <anime-banner class="banner" :anime="sequel"/>
      </div>
    </div>
  </div>
</transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { format, formatDistance } from 'date-fns'
import { mdiStar, mdiStarOutline } from '@mdi/js'

import { Sequel, ListEntry } from '@/state/app'
import { AnimePageQuery_anime_nextAiringEpisode } from '@/graphql/AnimePageQuery'
import { setScoreMutation } from '@/graphql/mutations'
import { prop } from '@/utils'

import AnimeBanner from '../AnimeBanner.vue'
import CButton from '../CButton.vue'
import Icon from '../Icon.vue'

@Component({
  components: { AnimeBanner, CButton, Icon },
})
export default class EndOfSeasonOverlay extends Vue {
  @Prop(Object) public listEntry!: ListEntry | null
  @Prop(prop(Array, true))
  public sequels!: Sequel[]
  @Prop(prop(Number, true))
  public episodeNumber!: number
  @Prop(Number) public episodesInAnime!: number | null
  @Prop(Object)
  public nextAiringEpisode!: AnimePageQuery_anime_nextAiringEpisode | null
  @Prop(prop(Boolean, true))
  public isPlayerMaximized!: boolean

  public scores = [1, 25, 50, 75, 100]

  public starSvg = mdiStar
  public hollowStarSvg = mdiStarOutline

  public get isFinalEpisode() {
    if (this.episodesInAnime == null) return false

    return this.episodeNumber >= this.episodesInAnime
  }

  public get nextEpisodeDateString() {
    if (!this.nextAiringEpisode) return null

    return format(this.nextAiringEpisode.airingAt * 1000, 'iii do MMM - kk:mm')
  }

  public get nextEpisodeDistanceString() {
    if (!this.nextAiringEpisode) return null

    return formatDistance(new Date(), this.nextAiringEpisode.airingAt * 1000)
  }

  public get endMessage() {
    return `The end${this.isFinalEpisode ? '!' : ' for now!'}`
  }

  public async updateScore(score: number) {
    if (!this.listEntry) return

    await setScoreMutation(
      this.$apollo,
      this.listEntry.id,
      score,
      this.listEntry,
    )
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

.end-of-season-container {
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
  overflow: hidden;
  transition: top 0.5s, height 0.5s, transform 0.5s;

  & > * {
    transition: opacity 0.5s;
    flex-shrink: 0;
  }

  &.small {
    top: 50%;
    height: 25px;
    transform: translateY(-50%);
    justify-content: flex-start;

    & > *:not(.text) {
      transition: opacity 0s;
      opacity: 0;
    }
  }

  & .text {
    height: 35px;
    font-size: 1.25em;
    padding: 5px;
    overflow: hidden;
    font-family: 'Raleway', sans-serif;
    text-shadow: $outline;
    font-weight: 600 !important;
    margin: 0;
    filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.35));

    &.two-lines {
      height: 60px;
    }

    &.v-enter-active,
    &.v-leave-active {
      transition: 0.25s;
    }

    &.v-enter,
    &.v-leave-to {
      height: 0;
      padding: 0;
    }
  }

  & > .scores-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    pointer-events: all;
    overflow: hidden;
    filter: drop-shadow(1px 2px 3px rgba(0, 0, 0, 0.5));
    transition: height 0.25s, opacity 0.25s;

    & > .score {
      position: relative;
      margin: 0 5px;
      height: 50px;
      width: 50px;
      cursor: pointer;
      pointer-events: all;
      transition: transform 0.15s;

      & > .icon {
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        fill: gold;
      }

      &:hover {
        transform: scale(1.1);
      }

      &:first-child {
        margin-left: 0;
      }
      &:last-child {
        margin-right: 0;
      }
    }
  }

  & > .sequel-container {
    & > .sequel {
      margin-bottom: 15px;
      overflow: hidden;
      text-shadow: $outline !important;
      filter: drop-shadow(1px 2px 3px rgba(0, 0, 0, 0.5));

      & > .button {
        position: relative;
        pointer-events: all;
        padding: 0.35em 2em 0.5em;
        font-size: 1.25em;
        height: 45px;

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

      & > .banner {
        width: 750px;
        max-width: 90%;
        pointer-events: all;
        overflow: hidden;
        border-radius: 5px;
        filter: drop-shadow(1px 2px 5px rgba(0, 0, 0, 0.5));
      }
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
