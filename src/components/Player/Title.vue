<template>
<div class="episode-info">
  <div class="episode-title-container">
    <h1 class="episode-number">{{episode.episodeNumber}}</h1>

    <div class="titles">
      <h1 class="episode-title" :class="{ blur: listEntry.progress < episode.episodeNumber }">
        {{episode.title}}
      </h1>

      <router-link :to="`/anime/${animeId}`">
        <h3 class="anime-title">
          {{animeName}}
        </h3>
      </router-link>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { ListEntry } from '@/state/app'
import { Episode } from '@/types'
import { prop } from '@/utils'

@Component
export default class PlayerTitle extends Vue {
  @Prop(prop(String, true))
  public animeName!: string
  @Prop(prop(Number, true))
  public animeId!: number
  @Prop(prop(Object, true))
  public episode!: Episode
  @Prop(Object) public listEntry!: ListEntry
}
</script>

<style scoped lang="scss">
@import '../../colors';

.episode-info {
  position: absolute;
  top: 5px;
  left: 5px;
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

  & > .episode-title-container {
    display: flex;
    color: $white;

    & > .episode-number {
      display: flex;
      align-items: center;
      margin: 0 10px;
      font-size: 2.25em;
    }

    & > .titles {
      margin-left: 5px;

      & .anime-title {
        margin: 0;
        font-size: 0.75em;
        font-weight: 600 !important;
      }

      & > .episode-title {
        height: 30px;
        margin: 5px 0;
        font-size: 1em;
        font-weight: 500 !important;
        overflow: show;

        transition: height 0.5s, opacity 0.5s, transform 0.5s;

        &.blur {
          height: 0;
          opacity: 0;
          transform: translateX(10%);
        }
      }
    }
  }
}
</style>
