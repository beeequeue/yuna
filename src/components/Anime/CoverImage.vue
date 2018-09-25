<template>
<div class="cover-image">
  <img :src="src" class="cover-image slide-down"/>

  <span
    v-if="mediaListStatus"
    class="status"
    :class="{ [lowercaseStatus]: !!mediaListStatus }"
  >
    <icon v-if="statusIcon" :icon="statusIcon"/>
    {{ statusString }}
  </span>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { pathOr } from 'rambda'
import {
  mdiCheckboxMarkedCircleOutline,
  mdiClockOutline,
  mdiCloseCircleOutline,
  mdiPauseCircleOutline,
  mdiRepeat,
} from '@mdi/js'

import Icon from '../Icon.vue'
import { prop } from '../../utils'
import { MediaListStatus } from '../../graphql-types'
import { AnimePage_Media_mediaListEntry } from '../../graphql/AnimePage'

@Component({
  components: { Icon },
})
export default class CoverImage extends Vue {
  @Prop(prop(String, true))
  public src!: string
  @Prop(prop(Object))
  public mediaListEntry!: AnimePage_Media_mediaListEntry | null
  @Prop(prop(Number))
  public length!: number | null

  public get mediaListStatus(): MediaListStatus | null {
    return pathOr(null, ['status'], this.mediaListEntry)
  }

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
        return `Watching ${pathOr(0, ['progress'], this.mediaListEntry)}/${
          this.length
        }`
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

  public get statusIcon() {
    if (!this.mediaListStatus) return null

    switch (this.mediaListStatus) {
      case MediaListStatus.COMPLETED:
        return mdiCheckboxMarkedCircleOutline
      case MediaListStatus.CURRENT:
        return null
      case MediaListStatus.DROPPED:
        return mdiCloseCircleOutline
      case MediaListStatus.PAUSED:
        return mdiPauseCircleOutline
      case MediaListStatus.PLANNING:
        return mdiClockOutline
      case MediaListStatus.REPEATING:
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
  border-radius: 5px;
  box-shadow: $shadow;

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
      margin-right: 5px;
      fill: $white;
    }
  }
}
</style>
