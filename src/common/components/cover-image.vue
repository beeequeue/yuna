<template>
  <div class="cover-image">
    <img :src="src" class="image" :style="{ background: color }" />

    <img :src="src" class="shadow" />

    <score
      v-if="showRating && listEntry"
      :media-id="listEntry.mediaId"
      :size="38"
    />

    <div
      v-if="mediaListStatus"
      class="status"
      :class="{ [lowercaseStatus]: !!mediaListStatus }"
    >
      <icon v-if="statusIcon" :icon="statusIcon" />

      {{ statusString }}
      <icon v-if="repeatedTimes > 0" class="repeat" :icon="repeatSvg" />
      {{ repeatedTimes > 0 ? repeatedTimes : null }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mdiRepeat } from '@mdi/js'
import Score from '@/common/components/score.vue'
import Icon from './icon.vue'

import { AnimeViewListEntry, MediaListStatus } from '@/graphql/generated/types'

import { Required } from '@/decorators'
import { getIconForStatus, humanizeMediaListStatus } from '@/utils'

@Component({ components: { Score, Icon } })
export default class CoverImage extends Vue {
  @Required(String) public src!: string
  @Prop(Boolean) public showRating!: boolean
  @Prop(String) public color!: string | null
  @Prop(Object) public listEntry!: AnimeViewListEntry | null
  @Prop(Number) public length!: number | null

  public repeatSvg = mdiRepeat

  public get mediaListStatus(): MediaListStatus | null {
    return this.listEntry?.status ?? null
  }

  public get repeatedTimes(): number {
    return this.listEntry?.rewatched ?? 0
  }

  public get lowercaseStatus() {
    if (!this.mediaListStatus) return null

    return this.mediaListStatus.toString().toLowerCase()
  }

  public get statusString(): string | null {
    if (!this.listEntry) return 'Not in List'

    return humanizeMediaListStatus(
      this.listEntry as AnimeViewListEntry,
      this.length,
    )
  }

  public get statusIcon() {
    return getIconForStatus(this.mediaListStatus, true)
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

  & > .image {
    position: relative;
    width: 100%;
    height: 100%;
    object-fit: cover;
    overflow: hidden;
    border-radius: 5px;
    z-index: 2;
  }

  & > .shadow {
    position: absolute;
    top: -5px;
    left: -5px;
    width: calc(100% + 10px);
    height: calc(100% + 10px);
    z-index: 1;
    filter: blur(10px) opacity(0.45) brightness(0.75);
  }

  & > .scores-container {
    position: absolute;
    bottom: 40px;
    width: 100%;
    padding: 0 5px;
    z-index: 3;
  }

  & > .status {
    position: absolute;
    bottom: 10px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Raleway', sans-serif;
    font-weight: 300;
    background-color: $dark;
    padding: 6px 0;
    z-index: 3;

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
