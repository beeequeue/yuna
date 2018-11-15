<template>
<router-link
  class="anime-banner"
  :to="`/anime/${anime.id}`">
  <img
    class="image"
    :class="{ faded }"
    :src="anime.bannerImage"
  />

  <span class="title">{{anime.title.userPreferred || anime.title}}</span>
</router-link>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { prop } from '../utils'

@Component
export default class AnimeBanner extends Vue {
  @Prop(Boolean) faded!: boolean | null
  @Prop(prop(Object, true))
  public anime!: {
    id: number
    title:
      | string
      | {
          userPreferred: string
        }
    bannerImage: string
  }
}
</script>

<style scoped lang="scss">
@import '../colors';

.anime-banner {
  display: inline-block;
  position: relative;
  height: 75px;
  background: black;

  & > .image {
    object-fit: cover;
    width: 100%;
    height: 100%;
    transition: filter 500ms;

    &.faded {
      filter: grayscale(0.5) opacity(0.5) brightness(0.75);
    }
  }

  & > .title {
    position: absolute;
    top: 0;
    left: 10%;
    height: 100%;
    width: 80%;

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
