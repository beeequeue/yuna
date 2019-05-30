<template>
  <div class="episode-info">
    <h1 class="episode-number">{{ episode.episodeNumber }}</h1>

    <div class="titles">
      <h1 class="episode-title" :class="{ blur: shouldHideTitle }">
        {{ episode.title }}
      </h1>

      <router-link :to="`/anime/${anime.id}`">
        <h3 class="anime-title">{{ anime.title.userPreferred }}</h3>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { EpisodeListEpisodes, PlayerAnimeAnime } from '@/graphql/types'

import { Required } from '@/decorators'
import { ListEntry } from '@/state/app'
import { getSpoilerSettings } from '@/state/settings'

@Component
export default class PlayerTitle extends Vue {
  @Required(Object) public anime!: PlayerAnimeAnime
  @Required(Object) public episode!: EpisodeListEpisodes
  @Prop(Object) public listEntry!: ListEntry

  public get shouldHideTitle() {
    return (
      getSpoilerSettings(this.$store).episode.name &&
      this.listEntry.progress < this.episode.episodeNumber
    )
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';
@import '../../utils';

.episode-info {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  color: $white;
  font-size: 26px;
  text-align: left;
  text-shadow: $outline;
  filter: drop-shadow(2px 2px 1px rgba(0, 0, 0, 0.25));
  user-select: initial;

  & a {
    color: $white;
    text-decoration: none;
  }

  & > .episode-number {
    @include RalewayNumber;
    display: flex;
    align-items: center;
    margin: 0 15px;
    font-size: 2.5em;
  }

  & > .titles {
    position: relative;
    width: 100%;
    margin-top: 10px;
    flex-shrink: 1;

    & > .episode-title {
      width: calc(100% - 200px);
      height: 30px;
      margin: 0;
      font-size: 1em;
      font-weight: 500 !important;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      transition: height 0.25s, opacity 0.5s, transform 0.5s;

      &.blur {
        height: 0;
        opacity: 0;
        transform: translateY(-30px);
        transition: height 0.65s, opacity 0.5s, transform 0.35s;
      }
    }

    & .anime-title {
      margin: 0;
      margin-top: 5px;
      font-size: 0.75em;
      font-weight: 600 !important;
    }
  }
}
</style>
