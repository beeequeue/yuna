<template>
  <router-link
    v-if="link"
    :to="`/anime/${anime.id}`"
    class="anime-banner"
    :style="{ background: `url(${diagmondsWebp})` }"
  >
    <img class="image" :class="{ faded }" :src="anime.bannerImage" />

    <span class="title">{{ anime.title.userPreferred || anime.title }}</span>
  </router-link>
  <span
    v-else
    class="anime-banner"
    :style="{ background: `url(${diagmondsWebp})` }"
  >
    <img class="image" :class="{ faded }" :src="anime.bannerImage" />

    <span class="title">{{ anime.title.userPreferred || anime.title }}</span>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import DiagmondsWebp from '@/assets/diagmonds.webp'
import { Required } from '@/decorators'

@Component
export default class AnimeBanner extends Vue {
  @Required(Object)
  public anime!: {
    id: number
    title:
      | string
      | {
          userPreferred: string
        }
    bannerImage: string
  }
  @Prop(Boolean) faded!: boolean | null
  @Prop(Boolean) link!: boolean | null

  public diagmondsWebp = DiagmondsWebp
}
</script>

<style scoped lang="scss">
@import '../colors';

.anime-banner {
  display: block;
  position: relative;
  height: 75px;
  width: 100%;

  & > .image {
    object-fit: cover;
    width: 100%;
    height: 100%;
    transition: filter 500ms;

    &:not([src]) {
      opacity: 0;
    }

    &.faded {
      filter: grayscale(0.5) opacity(0.5) brightness(0.75);
    }
  }

  & > .title {
    position: absolute;
    top: 0;
    left: 5%;
    height: 100%;
    width: 90%;
    overflow: hidden;

    display: flex;
    justify-content: center;
    align-items: center;

    font-family: 'Raleway', sans-serif;
    font-weight: 700;
    font-size: 1.5em;
    color: $white;
    text-shadow: $outline;
    filter: drop-shadow(1px 2px 2px rgba(0, 0, 0, 0.75));
  }
}
</style>
