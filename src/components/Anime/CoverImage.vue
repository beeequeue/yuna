<template>
<transition name="fade">
  <div v-if="!loading" class="cover-image">
    <img :src="src" class="cover-image slide-down"/>

    <span
      v-if="mediaListStatus"
      class="status"
      :class="{ [lowercaseStatus]: !!mediaListStatus }"
    >
      {{ statusString }}
    </span>
  </div>
</transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { prop } from '../../utils'
import { MediaListStatus } from '../../graphql-types'

@Component
export default class CoverImage extends Vue {
  @Prop(prop(Boolean, true))
  public loading!: boolean
  @Prop(prop(String, true))
  public src!: string
  @Prop(prop(String))
  public mediaListStatus!: MediaListStatus | null

  public get lowercaseStatus() {
    if (!this.mediaListStatus) return null

    return this.mediaListStatus.toString().toLowerCase()
  }

  public get statusString(): string | null {
    if (!this.mediaListStatus) return null

    switch (this.mediaListStatus) {
      case MediaListStatus.COMPLETED:
        return 'Completed'
      case MediaListStatus.CURRENT:
        return 'Watching'
      case MediaListStatus.DROPPED:
        return 'Dropped'
      case MediaListStatus.PAUSED:
        return 'Paused'
      case MediaListStatus.PLANNING:
        return 'Planning'
      case MediaListStatus.REPEATING:
        return 'Repeating'
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.cover-image {
  position: relative;
  width: 100%;
  border-radius: 5px;
  box-shadow: $shadow;

  & > .status {
    position: absolute;
    bottom: 35px;
    left: 0;
    right: 0;
    font-family: 'Raleway', sans-serif;
    font-weight: 500;
    background-color: $dark;
    padding: 6px 0;
  }
}
</style>
