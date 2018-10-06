<template>
<div class="title">
  <div
    class="english"
    :class="preferredStyle.english"
    :title="title.english"
  >
    {{ title.english }}
  </div>

  <div
    class="romaji"
    :class="preferredStyle.romaji"
    :title="title.romaji"
  >
    {{ title.romaji }}
  </div>

  <div
    class="native"
    :class="preferredStyle.native"
    :title="title.native"
  >
    {{ title.native }}
  </div>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { prop } from '../../utils'
import { AnimePageQuery_Media_title } from '../../graphql/AnimePageQuery'

@Component
export default class AnimeTitle extends Vue {
  @Prop(prop(Object))
  public title?: AnimePageQuery_Media_title

  public get preferredStyle() {
    if (!this.title) return { english: false, native: false, romaji: false }
    let alreadyExists = false

    const ifPreferred = (str: string) => {
      const classname =
        str === this.title.userPreferred && !alreadyExists ? 'preferred' : null

      if (classname !== null) {
        alreadyExists = true
      }

      return classname
    }

    return {
      english: ifPreferred(this.title.english),
      romaji: ifPreferred(this.title.romaji),
      native: ifPreferred(this.title.native),
    }
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
    padding: 5px 0;
    font-weight: 500;
    color: darken($white, 10%);
    text-align: left;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.75);
    user-select: initial;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    order: 2;

    &.preferred {
      padding-top: 0;
      font-size: 2em;
      font-weight: 300;
      color: $white;
      order: 1;
    }
  }
}
</style>
