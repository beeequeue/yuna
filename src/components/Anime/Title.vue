<template>
<div class="title">
  <div class="english" :class="preferredStyle(title.english)">
    {{ title.english }}
  </div>

  <div class="romaji" :class="preferredStyle(title.romaji)">
    {{ title.romaji }}
  </div>

  <div class="native" :class="preferredStyle(title.native)">
    {{ title.native }}
  </div>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { prop } from '../../utils'
import { AnimePage_Media_title } from '../../graphql/AnimePage'

@Component
export default class AnimeTitle extends Vue {
  @Prop(prop(Object))
  public title?: AnimePage_Media_title

  public preferredStyle(str: string) {
    if (!this.title) return null

    return str === this.title.userPreferred ? 'preferred' : null
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.title {
  display: flex;
  flex-direction: column;

  & > div {
    font-family: 'Raleway', sans-serif;
    margin: 5px 0;
    font-weight: 500;
    color: darken($white, 10%);
    text-align: left;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.75);
    user-select: initial;
    order: 2;

    &.preferred {
      margin: 0;
      font-size: 2em;
      font-weight: 300;
      color: $white;
      order: 1;
    }
  }
}
</style>
