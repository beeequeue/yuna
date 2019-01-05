<template>
  <div class="cover-image" :style="{ background: color }">
    <img :src="src" class="image" />

    <span
      v-if="mediaListStatus"
      class="status"
      :class="{ [lowercaseStatus]: !!mediaListStatus }"
    >
      <icon v-if="statusIcon" :icon="statusIcon" />

      {{ statusString }}
      <icon v-if="repeatedTimes > 0" class="repeat" :icon="repeatSvg" />
      {{ repeatedTimes > 0 ? repeatedTimes : null }}
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { pathOr } from 'rambdax'
import {
  mdiCheckboxMarkedCircleOutline,
  mdiClockOutline,
  mdiCloseCircleOutline,
  mdiPauseCircleOutline,
  mdiRepeat,
} from '@mdi/js'

import { AnimePageQueryMediaListEntry, MediaListStatus } from '@/graphql/types'
import { humanizeMediaListStatus, prop } from '@/utils'

import Icon from '../Icon.vue'

@Component({
  components: { Icon },
})
export default class CoverImage extends Vue {
  @Prop(prop(String, true))
  public src!: string
  @Prop(String) public color!: string | null
  @Prop(prop(Object))
  public mediaListEntry!: AnimePageQueryMediaListEntry | null
  @Prop(prop(Number))
  public length!: number | null

  public repeatSvg = mdiRepeat

  public get mediaListStatus(): MediaListStatus | null {
    return pathOr(null, ['status'], this.mediaListEntry)
  }

  public get repeatedTimes(): number {
    return pathOr(0, ['repeat'], this.mediaListEntry)
  }

  public get lowercaseStatus() {
    if (!this.mediaListStatus) return null

    return this.mediaListStatus.toString().toLowerCase()
  }

  public get statusString(): string | null {
    if (!this.mediaListEntry) return 'Not in List'

    return humanizeMediaListStatus(
      this.mediaListEntry as AnimePageQueryMediaListEntry,
      this.length,
    )
  }

  public get statusIcon() {
    if (!this.mediaListStatus) return null

    switch (this.mediaListStatus) {
      case MediaListStatus.Completed:
        return mdiCheckboxMarkedCircleOutline
      case MediaListStatus.Current:
        return null
      case MediaListStatus.Dropped:
        return mdiCloseCircleOutline
      case MediaListStatus.Paused:
        return mdiPauseCircleOutline
      case MediaListStatus.Planning:
        return mdiClockOutline
      case MediaListStatus.Repeating:
        return mdiRepeat
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../colors';

.cover-image {
  display: block;
  position: relative;
  width: 100%;
  height: 290px;
  border-radius: 5px;
  box-shadow: $shadow;
  overflow: hidden;

  & > .image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  & > .status {
    position: absolute;
    bottom: 25px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Raleway', sans-serif;
    font-weight: 300;
    background-color: $dark;
    padding: 6px 0;

    & > .icon {
      height: 1em;
      width: 1em;
      margin: 0 5px;
      fill: $white;

      &.repeat {
        margin-right: 1px;
      }
    }
  }
}
</style>
